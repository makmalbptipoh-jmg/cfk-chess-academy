(() => {
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  const isConfigured = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

  window.cfkTrack = function cfkTrack(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  if (!isConfigured) {
    window.cfkAnalyticsReady = false;
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true
  });
  window.cfkAnalyticsReady = true;

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    if (link.href.includes('wa.me/')) {
      window.cfkTrack('contact_whatsapp', {
        link_url: link.href,
        page_location: window.location.href
      });
    } else if (link.href.startsWith('tel:')) {
      window.cfkTrack('contact_phone', {
        link_url: link.href,
        page_location: window.location.href
      });
    }
  });
})();
