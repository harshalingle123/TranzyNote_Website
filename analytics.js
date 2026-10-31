/**
 * TranzyNote Analytics & Funnel Tracking
 * Tracks: download clicks, UTM sources, page engagement, CTA interactions
 * Storage: localStorage + beacon to the TranzyNote API /api/track (pageviews, downloads,
 * pricing clicks; shown in the app's Admin console > Website) + console log
 */
(function () {
    'use strict';

    // ============================================
    // UTM PARAMETER CAPTURE
    // ============================================
    function getUTMParams() {
        var params = new URLSearchParams(window.location.search);
        var utm = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'].forEach(function (key) {
            var val = params.get(key);
            if (val) utm[key] = val;
        });
        return utm;
    }

    function storeUTM() {
        var utm = getUTMParams();
        if (Object.keys(utm).length > 0) {
            // Store first-touch attribution (don't overwrite)
            if (!localStorage.getItem('tn_utm_first')) {
                localStorage.setItem('tn_utm_first', JSON.stringify(utm));
            }
            // Always update last-touch
            localStorage.setItem('tn_utm_last', JSON.stringify(utm));
        }
    }

    function getAttribution() {
        var first = JSON.parse(localStorage.getItem('tn_utm_first') || '{}');
        var last = JSON.parse(localStorage.getItem('tn_utm_last') || '{}');
        return { first_touch: first, last_touch: last };
    }

    // ============================================
    // SESSION & VISITOR TRACKING
    // ============================================
    function getVisitorId() {
        var id = localStorage.getItem('tn_visitor_id');
        if (!id) {
            id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tn_visitor_id', id);
        }
        return id;
    }

    function getSessionId() {
        var sid = sessionStorage.getItem('tn_session_id');
        if (!sid) {
            sid = 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('tn_session_id', sid);
        }
        return sid;
    }

    function incrementVisitCount() {
        var count = parseInt(localStorage.getItem('tn_visit_count') || '0', 10) + 1;
        localStorage.setItem('tn_visit_count', count.toString());
        return count;
    }

    // ============================================
    // SEND TO THE TRANZYNOTE API
    // ============================================
    // Only the events that answer "how many people visit, download and sign up, and from where".
    // Anonymous: random visitor id, page, referring site's host, UTM tags, OS family.
    var TRACK_URL = window.TN_TRACK_URL || 'https://tranzynote-api.azurewebsites.net/api/track';

    function serverEventName(evt) {
        if (evt.category === 'pageview') return 'pageview';
        if (evt.category === 'download') return 'download';
        if (evt.category === 'navigation' && evt.label === 'pricing_page') return 'pricing_click';
        return null;
    }

    function referrerHost() {
        try {
            var host = document.referrer ? new URL(document.referrer).hostname : '';
            return host === window.location.hostname ? '' : host;
        } catch (e) {
            return '';
        }
    }

    function sendToServer(evt) {
        var name = serverEventName(evt);
        if (!name) return;
        // Don't count local previews or file:// copies of the site
        if (window.location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && !window.TN_TRACK_URL) return;
        var last = evt.attribution.last_touch || {};
        var first = evt.attribution.first_touch || {};
        var os = evt.platform;
        if (name === 'download') {
            // Download labels end with the OS of the file clicked: "hero_windows", "nav_mac-arm64"
            os = String(evt.label).split('_').pop().split('-')[0] || os;
        }
        var body = JSON.stringify({
            event: name,
            label: String(evt.label || '').slice(0, 120),
            page: evt.page,
            visitor: evt.visitor,
            session: evt.session,
            referrer: referrerHost(),
            utm_source: last.utm_source || last.ref || '',
            utm_medium: last.utm_medium || '',
            utm_campaign: last.utm_campaign || '',
            first_source: first.utm_source || first.ref || '',
            os: os
        });
        try {
            if (navigator.sendBeacon && navigator.sendBeacon(TRACK_URL, new Blob([body], { type: 'text/plain' }))) return;
        } catch (e) { /* fall through */ }
        try {
            fetch(TRACK_URL, { method: 'POST', body: body, keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } });
        } catch (e) { /* tracking must never break the page */ }
    }

    // ============================================
    // EVENT TRACKING
    // ============================================
    var events = [];

    function trackEvent(category, action, label, value) {
        var evt = {
            ts: new Date().toISOString(),
            category: category,
            action: action,
            label: label || '',
            value: value || 0,
            page: window.location.pathname,
            visitor: getVisitorId(),
            session: getSessionId(),
            attribution: getAttribution(),
            referrer: document.referrer || '(direct)',
            ua: navigator.userAgent,
            screen: window.innerWidth + 'x' + window.innerHeight,
            platform: (window.TranzyPlatform || {}).os || 'unknown'
        };

        events.push(evt);

        // Store in localStorage (rolling buffer of last 100 events)
        var stored = JSON.parse(localStorage.getItem('tn_events') || '[]');
        stored.push(evt);
        if (stored.length > 100) stored = stored.slice(-100);
        localStorage.setItem('tn_events', JSON.stringify(stored));

        // Console log for debugging
        console.log('[TN Analytics]', category, action, label, evt);

        sendToServer(evt);

        // Send to Application Insights if available
        if (window.appInsights && window.appInsights.trackEvent) {
            window.appInsights.trackEvent({
                name: category + '_' + action,
                properties: {
                    label: label,
                    page: evt.page,
                    utm_source: (evt.attribution.last_touch || {}).utm_source || '',
                    utm_medium: (evt.attribution.last_touch || {}).utm_medium || '',
                    utm_campaign: (evt.attribution.last_touch || {}).utm_campaign || '',
                    referrer: evt.referrer,
                    platform_os: evt.platform
                }
            });
        }
    }

    // ============================================
    // DOWNLOAD CLICK TRACKING
    // ============================================
    function trackDownloads() {
        // Track all download buttons (they have data-download attribute)
        document.addEventListener('click', function (e) {
            var link = e.target.closest('[data-download]');
            if (!link) return;

            var downloadType = link.getAttribute('data-download') || 'unknown';
            var href = link.href || '';
            var os = 'unknown';

            if (href.indexOf('windows') !== -1) os = 'windows';
            else if (href.indexOf('arm64') !== -1) os = 'mac-arm64';
            else if (href.indexOf('x64') !== -1) os = 'mac-intel';
            else if (href.indexOf('linux') !== -1) os = 'linux';

            trackEvent('download', 'click', downloadType + '_' + os, 1);
            if (window.tnAds) window.tnAds.download();

            // Store download timestamp
            localStorage.setItem('tn_last_download', new Date().toISOString());
            var dlCount = parseInt(localStorage.getItem('tn_download_count') || '0', 10) + 1;
            localStorage.setItem('tn_download_count', dlCount.toString());
        });
    }

    // ============================================
    // CTA & ENGAGEMENT TRACKING
    // ============================================
    function trackCTAs() {
        document.addEventListener('click', function (e) {
            // Pricing link
            var pricingLink = e.target.closest('a[href="payment.html"], a[href*="payment"]');
            if (pricingLink) {
                trackEvent('navigation', 'click', 'pricing_page');
            }

            // FAQ expand
            var faqBtn = e.target.closest('.faq-question-modern');
            if (faqBtn) {
                var questionText = (faqBtn.textContent || '').trim().substring(0, 60);
                trackEvent('engagement', 'faq_expand', questionText);
            }

            // Mode toggle (detectable/incognito)
            var modeToggle = e.target.closest('#modeToggle');
            if (modeToggle) {
                trackEvent('engagement', 'mode_toggle', 'detectable_incognito');
            }

            // External links (social)
            var extLink = e.target.closest('a[href^="http"]');
            if (extLink && extLink.hostname !== window.location.hostname) {
                trackEvent('outbound', 'click', extLink.href);
            }
        });
    }

    // ============================================
    // SCROLL DEPTH TRACKING
    // ============================================
    function trackScrollDepth() {
        var milestones = [25, 50, 75, 100];
        var reached = {};

        function checkScroll() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;

            var pct = Math.round((scrollTop / docHeight) * 100);

            milestones.forEach(function (m) {
                if (pct >= m && !reached[m]) {
                    reached[m] = true;
                    trackEvent('engagement', 'scroll_depth', m + '%', m);
                }
            });
        }

        var throttled = false;
        window.addEventListener('scroll', function () {
            if (!throttled) {
                throttled = true;
                setTimeout(function () {
                    checkScroll();
                    throttled = false;
                }, 500);
            }
        });
    }

    // ============================================
    // TIME ON PAGE TRACKING
    // ============================================
    function trackTimeOnPage() {
        var startTime = Date.now();
        var intervals = [10, 30, 60, 120, 300]; // seconds
        var tracked = {};

        setInterval(function () {
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            intervals.forEach(function (s) {
                if (elapsed >= s && !tracked[s]) {
                    tracked[s] = true;
                    trackEvent('engagement', 'time_on_page', s + 's', s);
                }
            });
        }, 5000);
    }

    // ============================================
    // SECTION VISIBILITY TRACKING
    // ============================================
    function trackSectionViews() {
        if (!('IntersectionObserver' in window)) return;

        var sections = ['features', 'how-it-works', 'faq'];
        var viewed = {};

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !viewed[entry.target.id]) {
                    viewed[entry.target.id] = true;
                    trackEvent('engagement', 'section_view', entry.target.id);
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }

    // ============================================
    // ANALYTICS DASHBOARD (accessible via console)
    // ============================================
    window.TN_Analytics = {
        getEvents: function () {
            return JSON.parse(localStorage.getItem('tn_events') || '[]');
        },
        getVisitor: function () {
            return {
                id: getVisitorId(),
                visits: parseInt(localStorage.getItem('tn_visit_count') || '0', 10),
                downloads: parseInt(localStorage.getItem('tn_download_count') || '0', 10),
                lastDownload: localStorage.getItem('tn_last_download'),
                attribution: getAttribution()
            };
        },
        getSummary: function () {
            var evts = this.getEvents();
            var downloads = evts.filter(function (e) { return e.category === 'download'; });
            var sources = {};
            evts.forEach(function (e) {
                var src = (e.attribution.last_touch || {}).utm_source || 'organic';
                sources[src] = (sources[src] || 0) + 1;
            });
            return {
                totalEvents: evts.length,
                downloads: downloads.length,
                sourceBreakdown: sources,
                visitor: this.getVisitor()
            };
        },
        clear: function () {
            localStorage.removeItem('tn_events');
            console.log('[TN Analytics] Events cleared');
        }
    };

    // ============================================
    // INIT
    // ============================================
    function init() {
        storeUTM();
        var visitCount = incrementVisitCount();

        trackEvent('pageview', 'load', window.location.pathname, visitCount);
        trackDownloads();
        trackCTAs();
        trackScrollDepth();
        trackTimeOnPage();
        trackSectionViews();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
