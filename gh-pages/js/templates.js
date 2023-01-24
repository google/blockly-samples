
// Immediately append this to the head.
document.write(
`
<link rel="icon" type="image/x-icon" href="../../gh-pages/favicon.ico">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic">
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="../../gh-pages/css/custom.css">
`);

function templateTop() {
  document.body.classList.add('root');

  // Extract the title from the page's title.
  const title = document.title;

  // Extract the description from the page's meta tag.
  let description = '';
  for (const meta of this.document.getElementsByTagName('meta')) {
    if (meta.getAttribute('name') === 'description') {
      description = meta.getAttribute('content');
    }
  }

  // Extract tab info from the page's link tags.
  let tabs = '';
  for (const link of this.document.getElementsByTagName('link')) {
    if (link.getAttribute('rel') === 'next') {
      tabs += `<li><a href="${link.getAttribute('href')}">${link.getAttribute('title')}</a></li>\n`;
    }
  }
  if (tabs) {
    tabs = '<ul id="tabs">\n' + tabs + '</ul>\n';
  }

  // Extract the path from the URL.
  const m = location.pathname.match(/\/([^\/]+\/[^\/]+)\/[^\/]*$/);
  const path = m ? '/tree/master/' + m[1] : '';

  // Add the window dressing to the body.
  document.write(`
  <nav id="toolbar">
    <a href="../../" id="arrow-back">
      <i class="material-icons">close</i>
      <img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
        height=36 width=120 alt="Blockly">
    </a>

    <div class="title-grow">
      <div class="title">${title}</div>
      <div class="subtitle">${description}</div>
    </div>

    <a href="https://github.com/google/blockly-samples${path}" class="button" target="_blank">View code</a>
  </nav>

  <!-- CONTENT  -->
  <main id="main" ${tabs ? 'class="has-tabs"' : ''}>

${tabs}

    <div class="drop-shadow"></div>
    <div class="content">
`);
}

function templateBottom() {
  document.write(`
    </div>
  </main>

  <footer id="footer">
    <div class="footer-wrapper site-width">
      <div class="link-list">
        <label>Developer Resources</label>
        <ul>
          <li><a target="_blank" href="https://developers.google.com/blockly/guides/overview/">Developer Docs</a></li>
          <li><a target="_blank" href="https://blocklycodelabs.dev/">Codelabs</a></li>
          <li><a target="_blank" href="https://blockly-demo.appspot.com/static/demos/blockfactory/index.html">Developer
              Tools</a></li>
        </ul>
      </div>
      <div class="link-list">
        <label>Github</label>
        <ul>
          <li><a target="_blank" href="https://github.com/google/blockly/">Blockly Sources</a></li>
          <li><a target="_blank" href="https://github.com/google/blockly-samples/">Blockly Samples</a></li>
        </ul>
      </div>
      <div class="link-list">
        <label>Support</label>
        <ul>
          <li><a target="_blank" href="https://groups.google.com/forum/#!forum/blockly/">Support</a></li>
        </ul>
        <div>Published with <a href="https://pages.github.com">GitHub Pages</a></div>
      </div>
    </div>
  </footer>
`);

  if (location.href.startsWith('https://google.github.io/blockly-samples/')) {
    document.write(`
  <!-- ANALYTICS  -->
  <script>
    (function (i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', '{{ site.google_analytics }}', 'auto');
    ga('send', 'pageview');
  </script>
`);
  }
}
