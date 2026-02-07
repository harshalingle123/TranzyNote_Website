/**
 * TranzyNote Platform Detection
 * Detects user OS and rewrites download links/button text accordingly.
 */
(function () {
    'use strict';

    var URLS = {
        windows: 'https://tranzynotestorage.blob.core.windows.net/releases/windows/TranzyNote-Setup-latest.exe',
        macArm: 'https://tranzynotestorage.blob.core.windows.net/releases/macos/TranzyNote-latest-arm64.dmg',
        macIntel: 'https://tranzynotestorage.blob.core.windows.net/releases/macos/TranzyNote-latest-x64.dmg',
        linux: 'https://tranzynotestorage.blob.core.windows.net/releases/linux/TranzyNote-latest.AppImage'
    };

    function detectAppleSilicon() {
        try {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                var dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) {
                    var renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase();
                    if (renderer.indexOf('apple m') !== -1 || renderer.indexOf('apple gpu') !== -1) {
                        return true;
                    }
                }
            }
        } catch (e) { /* ignore */ }
        // Default to arm64 for modern Macs (M1+ is now the majority)
        return true;
    }

    function detect() {
        var ua = navigator.userAgent || '';
        var platform = navigator.platform || '';
        var uaLower = ua.toLowerCase();
        var platLower = platform.toLowerCase();

        // Mobile detection - fallback to Windows
        if (/android|iphone|ipad|ipod|mobile/i.test(uaLower)) {
            return { os: 'windows', downloadUrl: URLS.windows, buttonText: 'Get for Windows', label: 'Windows' };
        }

        // macOS
        if (platLower.indexOf('mac') !== -1 || uaLower.indexOf('macintosh') !== -1) {
            var isArm = detectAppleSilicon();
            return {
                os: 'mac',
                downloadUrl: isArm ? URLS.macArm : URLS.macIntel,
                buttonText: 'Get for macOS',
                label: 'macOS',
                arch: isArm ? 'arm64' : 'x64'
            };
        }

        // Linux
        if (platLower.indexOf('linux') !== -1 || uaLower.indexOf('linux') !== -1) {
            return { os: 'linux', downloadUrl: URLS.linux, buttonText: 'Get for Linux', label: 'Linux' };
        }

        // Default: Windows
        return { os: 'windows', downloadUrl: URLS.windows, buttonText: 'Get for Windows', label: 'Windows' };
    }

    var info = detect();
    window.TranzyPlatform = info;

    function applyToDOM() {
        // Rewrite all [data-download] link hrefs
        var links = document.querySelectorAll('[data-download]');
        for (var i = 0; i < links.length; i++) {
            links[i].href = info.downloadUrl;
        }

        // Rewrite [data-download-text="os"] button text spans
        var textEls = document.querySelectorAll('[data-download-text="os"]');
        for (var j = 0; j < textEls.length; j++) {
            var span = textEls[j].querySelector('span');
            if (span) {
                span.textContent = info.buttonText;
            } else {
                textEls[j].textContent = info.buttonText;
            }
        }

        // Build "Also available for" links - hide detected OS
        // macOS shows two sub-links (Apple Silicon & Intel)
        var platforms = [
            { os: 'windows', label: 'Windows', url: URLS.windows },
            { os: 'mac', label: 'macOS', subLinks: [
                { label: 'Apple Silicon', url: URLS.macArm },
                { label: 'Intel', url: URLS.macIntel }
            ]},
            { os: 'linux', label: 'Linux', url: URLS.linux }
        ];

        var otherContainers = document.querySelectorAll('.platform-links');
        for (var k = 0; k < otherContainers.length; k++) {
            var container = otherContainers[k];
            container.innerHTML = '';
            var textNode = document.createElement('span');
            textNode.className = 'other-platforms-text';
            textNode.textContent = 'Also available for ';
            container.appendChild(textNode);

            var added = 0;
            for (var p = 0; p < platforms.length; p++) {
                if (platforms[p].os === info.os) continue;
                if (added > 0) {
                    container.appendChild(document.createTextNode(' & '));
                }
                if (platforms[p].subLinks) {
                    // macOS: show "macOS (Apple Silicon | Intel)"
                    var label = document.createElement('span');
                    label.className = 'other-platforms-link';
                    label.textContent = platforms[p].label + ' (';
                    container.appendChild(label);
                    for (var s = 0; s < platforms[p].subLinks.length; s++) {
                        if (s > 0) {
                            container.appendChild(document.createTextNode(' | '));
                        }
                        var subA = document.createElement('a');
                        subA.href = platforms[p].subLinks[s].url;
                        subA.textContent = platforms[p].subLinks[s].label;
                        subA.className = 'other-platforms-link';
                        container.appendChild(subA);
                    }
                    container.appendChild(document.createTextNode(')'));
                } else {
                    var a = document.createElement('a');
                    a.href = platforms[p].url;
                    a.textContent = platforms[p].label;
                    a.className = 'other-platforms-link';
                    container.appendChild(a);
                }
                added++;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyToDOM);
    } else {
        applyToDOM();
    }
})();
