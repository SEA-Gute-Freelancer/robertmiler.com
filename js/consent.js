/* robertmiler.com — Consent Banner (Consent Mode V2)
 * Defaults werden inline im <head> jeder Seite gesetzt.
 * Diese Datei ist nur fuer das UI + Entscheidungslogik.
 * Stored entscheidung: localStorage key "rm_consent_v2", 13 Monate gueltig.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'rm_consent_v2';
  var TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000; // 13 Monate (DSK-Empfehlung)

  function readStored() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s && s.timestamp && Date.now() - s.timestamp < TTL_MS) return s;
    } catch (e) {}
    return null;
  }

  function gtagSafe() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
  }

  function setConsent(accepted) {
    gtagSafe();
    var signals = accepted ? {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted'
    } : {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied'
    };

    window.gtag('consent', 'update', signals);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        signals: signals,
        accepted: accepted,
        timestamp: Date.now(),
        version: 2
      }));
    } catch (e) {}

    window.dataLayer.push({
      event: 'consent_decision',
      consent_accepted: accepted
    });

    hideBanner();
  }

  function showBanner() {
    if (document.getElementById('rm-consent-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'rm-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einwilligung');
    banner.innerHTML =
      '<style>' +
        '#rm-consent-banner{position:fixed;bottom:16px;left:16px;right:16px;z-index:999999;' +
        'max-width:480px;margin-left:auto;margin-right:auto;background:rgba(26,26,26,0.97);' +
        'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
        'border:1px solid rgba(255,255,255,0.08);border-radius:10px;' +
        'box-shadow:0 12px 48px rgba(0,0,0,0.6);padding:18px 20px;' +
        'font-family:"Inter",-apple-system,sans-serif;color:#e0e0e0;font-size:13px;line-height:1.55;' +
        'animation:rm-consent-in 0.35s cubic-bezier(0.4,0,0.2,1)}' +
        '@keyframes rm-consent-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
        '#rm-consent-banner .rm-c-title{font-family:"JetBrains Mono",monospace;font-size:11px;' +
        'color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px}' +
        '#rm-consent-banner p{color:#ccc;margin:0 0 14px 0}' +
        '#rm-consent-banner a{color:#6a9abb;text-decoration:none}' +
        '#rm-consent-banner a:hover{text-decoration:underline}' +
        '#rm-consent-banner .rm-c-btns{display:flex;gap:8px;flex-wrap:wrap}' +
        '#rm-consent-banner button{flex:1;min-width:120px;padding:9px 16px;' +
        'border:1px solid;border-radius:6px;font-family:"JetBrains Mono",monospace;' +
        'font-size:12px;cursor:pointer;transition:opacity 0.15s,transform 0.1s}' +
        '#rm-consent-banner button:hover{opacity:0.85}' +
        '#rm-consent-banner button:active{transform:scale(0.98)}' +
        '#rm-consent-banner .rm-c-accept{background:#6a9abb;color:#fff;border-color:#6a9abb}' +
        '#rm-consent-banner .rm-c-reject{background:transparent;color:#888;' +
        'border-color:rgba(255,255,255,0.15)}' +
        '@media (max-width:600px){#rm-consent-banner{left:12px;right:12px;bottom:12px;padding:14px 16px}}' +
      '</style>' +
      '<div class="rm-c-title">cookies &amp; tracking</div>' +
      '<p>Diese Seite nutzt Google Analytics und Google Ads, um zu messen, was funktioniert. ' +
      'Cool, wenn du das erlaubst &mdash; sonst halt nicht. <a href="datenschutz.html">Mehr dazu</a>.</p>' +
      '<div class="rm-c-btns">' +
        '<button class="rm-c-reject" type="button">Ablehnen</button>' +
        '<button class="rm-c-accept" type="button">Akzeptieren</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.rm-c-accept').addEventListener('click', function () { setConsent(true); });
    banner.querySelector('.rm-c-reject').addEventListener('click', function () { setConsent(false); });
  }

  function hideBanner() {
    var banner = document.getElementById('rm-consent-banner');
    if (banner) banner.remove();
  }

  function init() {
    if (readStored()) return; // Entscheidung liegt vor (inline-Script hat sie schon angewendet)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  // Globale API zum erneuten Aufruf (Footer-Link „Cookie-Einstellungen")
  window.rmConsent = {
    show: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      showBanner();
    },
    accept: function () { setConsent(true); },
    reject: function () { setConsent(false); }
  };

  init();
})();
