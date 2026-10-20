/**
 * TranzyNote Google Ads tracking.
 *
 * Fill in the three values below from Google Ads (Goals > Conversions):
 *   id            the Google tag ID, looks like AW-123456789
 *   signupLabel   the label of the "Sign up" conversion action
 *   downloadLabel the label of the "Download" conversion action (optional)
 *
 * Until `id` is a real AW- ID this file does nothing, so it is safe to deploy as is.
 *
 * Sign-ups happen inside the desktop app, so the app opens /welcome in the user's
 * browser after a new account is created; welcome.html calls tnAds.signup().
 */
(function () {
    'use strict';

    var CONFIG = {
        id: 'AW-XXXXXXXXXX',
        signupLabel: 'XXXXXXXXXXXXXXXXXXXX',
        downloadLabel: 'XXXXXXXXXXXXXXXXXXXX'
    };

    function isSet(value, pattern) {
        return typeof value === 'string' && pattern.test(value);
    }

    var live = isSet(CONFIG.id, /^AW-\d+$/);
    var signupReady = live && isSet(CONFIG.signupLabel, /^[\w-]{8,}$/) && CONFIG.signupLabel.indexOf('XXXX') === -1;
    var downloadReady = live && isSet(CONFIG.downloadLabel, /^[\w-]{8,}$/) && CONFIG.downloadLabel.indexOf('XXXX') === -1;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    if (live) {
        var tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.id);
        document.head.appendChild(tag);
        window.gtag('js', new Date());
        window.gtag('config', CONFIG.id);
    }

    function convert(label, extra) {
        var payload = { send_to: CONFIG.id + '/' + label };
        for (var key in extra) {
            if (Object.prototype.hasOwnProperty.call(extra, key)) payload[key] = extra[key];
        }
        window.gtag('event', 'conversion', payload);
    }

    window.tnAds = {
        live: live,

        /** A visitor clicked a download button */
        download: function () {
            if (downloadReady) convert(CONFIG.downloadLabel, {});
        },

        /**
         * A new account was created in the app. `transactionId` stops a reload of the welcome
         * page from counting the same sign-up twice.
         */
        signup: function (transactionId) {
            if (!signupReady) return;
            convert(CONFIG.signupLabel, transactionId ? { transaction_id: transactionId } : {});
        }
    };
})();
