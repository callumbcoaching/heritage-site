/* CALLUM.B · checkout links — ONE place to wire payment.
   Physique OS and Keep the Muscle now run on STRIPE (1FIT can't issue a shop
   link — payment there is tied to a specific customer). Create the Stripe
   payment link, set its success URL to https://callumbcoaching.co.uk/os-setup,
   paste the link between the quotes below, redeploy. Done.
   While a link is empty, that button falls back to the application form —
   nothing breaks, people can still buy via you manually.

   NOTE: Stripe does NOT revoke 1FIT access when someone cancels. Reconcile
   Stripe cancellations against 1FIT clients weekly. */
window.PAY_LINKS = {
  'os-monthly':          'https://buy.stripe.com/3cI4gBgjd8Pc0o49Ui00004',  // Physique OS — Monthly £29/mo
  'os-annual':           'https://buy.stripe.com/cNifZj2snc1o7Qw7Ma00005',  // Physique OS — Annual £249/yr
  'ktm-monthly':         '',  // Keep the Muscle — Monthly £29/mo
  'ktm-annual':          '',  // Keep the Muscle — Annual £249/yr
  'blueprint-nutrition': '',  // Nutrition Blueprint £99
  'blueprint-glp1':      '',  // GLP-1 Blueprint £99
  'ninety':              ''   // The Ninety £297
};
window.payLink = function (key, fallback) {
  var url = (window.PAY_LINKS && window.PAY_LINKS[key]) || '';
  return url !== '' ? url : fallback;
};

/* Auto-rewrite: any <a href="...plan=..."> whose plan name matches a package
   with a live 1FIT link gets pointed straight at checkout. No per-page code. */
document.addEventListener('DOMContentLoaded', function () {
  var MAP = {
    'Physique OS — Monthly': 'os-monthly',
    'Physique OS — Annual':  'os-annual',
    'Keep the Muscle — Monthly': 'ktm-monthly',
    'Keep the Muscle — Annual':  'ktm-annual',
    'Nutrition Blueprint': 'blueprint-nutrition',
    'GLP-1 Blueprint':     'blueprint-glp1',
    'The Ninety':          'ninety'
  };
  document.querySelectorAll('a[href*="plan="]').forEach(function (a) {
    var plan;
    try { plan = decodeURIComponent(a.getAttribute('href')).split('plan=')[1] || ''; }
    catch (e) { return; }
    for (var name in MAP) {
      if (plan.indexOf(name) === 0) {
        var url = window.PAY_LINKS[MAP[name]];
        if (url) a.setAttribute('href', url);
        break;
      }
    }
  });
});
