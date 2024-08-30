<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KWJB80QBVP"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KWJB80QBVP');
</script>

<!-- Google Analytics Script for Netlify Post-Processing -->
<script>
  var GA_MEASUREMENT_ID = 'G-KWJB80QBVP';
  // Function to get cookie value
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  // Check for the specific cookie
  var specificCookie = getCookie('edge_redirect');
  if (specificCookie === 'bb') {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    // Load the Google Analytics script
    var script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    script.async = true;
    document.head.appendChild(script);
  }
</script>
