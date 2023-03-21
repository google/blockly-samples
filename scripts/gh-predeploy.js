/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks for preparing plugins for deployment to github pages.
 */

const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const showdown = require('showdown');
gulp.header = require('gulp-header');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/**
 * Inject head HTML for a plugin or example page on gh-pages.
 * This finds the existing head tag and inserts a few additional lines of CSS,
 * as well as updating the title to match the plugin or example's name.
 * @param {string} initialContents The initial page HTML, as a string.
 * @param {string} title The title to use for the page, which may be generated from the package
 *    name or specified explicitly.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectHeader(initialContents, title) {
  let baseurl = '/blockly-samples';

  let headerAdditions = `
  <!-- INJECTED HEADER -->
  <meta name="viewport" content="width=device-width,maximum-scale=2">
  <link rel="icon" type="image/x-icon" href="${baseurl}/favicon.ico" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="${baseurl}/css/custom.css"/>
  <!-- END INJECTED HEADER -->`;

  // Replace the title with a more descriptive title.
  let modifiedContents = initialContents.replace(/<title>.*<\/title>/,
      `<title>${title}</title>`);
  // Add some CSS at the beginning of the header. Any CSS the page already had will be higher priority.
  modifiedContents = modifiedContents.replace(/<\s*head\s*>/,
      `<head>${headerAdditions}`);
  return modifiedContents;
}

/**
 * Create footer HTML for a plugin demo page on gh-pages.
 * @param {string} initialContents The initial page HTML, as a string.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectFooter(initialContents) {
  let footer = `
  <!-- FOOTER  -->
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
  <!-- END FOOTER -->
`;

  // Insert the footer at the end of the body.
  return initialContents.replace(/(<\s*\/\s*body\s*>)/, `${footer}$1`)
}

/**
 * Inject nav bar HTML for a specific plugin at the beginning of the body.
 * @param {string} initialContents The initial page HTML, as a string.
 * @param {!Object} packageJson The contents of the plugin's package.json.
 * @param {string} pluginDir The directory of the plugin that is currently being prepared.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectPluginNavBar(inputString, packageJson, pluginDir) {
  // Build up information from package.json.
  let title = `${packageJson.name} Demo`;
  let description = packageJson.description;
  let version = packageJson.version;
  let codeLink = `https://github.com/google/blockly-samples/blob/master/plugins/${pluginDir}`;

  let npmLink = `https://www.npmjs.com/package/${packageJson.name}`;
  let baseurl = '/blockly-samples';

  // Assemble that information into a nav bar and tabs for getting to the
  // playground and README pages.
  let navBar = `
  <!-- NAV BAR -->
  <nav id="toolbar">
    <a href="${baseurl}" id="arrow-back">
      <i class="material-icons">close</i>
      <img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
        alt="Blockly logo" />
    </a>

    <div class="title-grow">
      <div class="title">${title}</div>
      <div class="subtitle">${description}</div>
    </div>
    ${version}
    
    <a href="${codeLink}" class="button" target="_blank">View code</a>
    <a href="${npmLink}" class="button" target="_blank">View on npm</a>
  </nav>
  <!-- END NAV BAR -->
  ${createPluginTabs(pluginDir)}`

  // Find the start of the body and inject the nav bar just after the opening <body> tag,
  // preserving anything else in the tag (such as onload).
  // Also wrap all page content in a <main></main> tag.
  let modifiedContent = inputString.replace(
    /<body([^>]*)>/,
    `<body$1 class="root">
    <main id="main" class="has-tabs">${navBar}`
    );
  modifiedContent = modifiedContent.replace(/(<\/body>)/, `</main>$1`);
  return modifiedContent;
}

/**
 * Create the tabs for switching between playground and README pages.
 * @param {string} pluginDir The directory of the plugin that is currently being prepared.
 * @returns {string} The HTML for the page tabs, as a string.
 */
function createPluginTabs(pluginDir) {
  const baseurl = '/blockly-samples';
  return `
  <!-- PAGE TABS -->
  <ul id="tabs">
    <li>
      <a href="${baseurl}/plugins/${pluginDir}/test/index">
        Playground
      </a>
    </li>
    <li>
      <a href="${baseurl}/plugins/${pluginDir}/README">
        README
      </a>
    </li>
  </ul>
  <!-- END PAGE TABS -->
  `;
}

/**
 * Create the tabs for switching between pages in an example.
 * The pages to include are specified in the example's package.json.
 * @param {string} pageRoot The directory of the example that is currently being prepared.
 * @returns {string} The HTML for the page tabs, as a string.
 */
function createExampleTabs(pageRoot, pages) {
  // local testing:
  //const baseurl = 'http://127.0.0.1:8080';
  // gh-pages:
  const baseurl = '/blockly-samples';
  function createTab(page) {
    return `
      <li>
        <a href="${baseurl}/${pageRoot}/${page.link}">
          ${page.label}
        </a>
      </li>
      `;
  }

  let tabsString = ``;

  for (const page of pages) {
    tabsString += createTab(page); 
  }

  return `
  <!-- PAGE TABS -->
  <ul id="tabs">
  ${tabsString}
  </ul>
  <!-- END PAGE TABS -->`;
}

/**
 * Create the index.html page for the plugin's page on github pages.
 * This page has the plugin's test playground, but wraps it in a 
 * devsite-style header and footer, and includes the plugin's readme and 
 * links to the plugin source files on GitHub and published package on npm.
 * @param {string} pluginDir The directory of the plugin that is currently being prepared.
 */
function createPluginPage(pluginDir) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const initialContents = fs.readFileSync(path.join('plugins', pluginDir, 'test', 'index.html')).toString();
  let title = `${packageJson.name} Demo`;
  let contents = injectHeader(initialContents, title);
  contents = injectPluginNavBar(contents, packageJson, pluginDir);
  contents = injectFooter(contents);
  
  const dirPath = path.join('gh-pages', 'plugins', pluginDir, 'test');
  fs.mkdirSync(dirPath, { recursive: true });

  fs.writeFileSync(path.join(dirPath, 'index.html'), contents, 'utf-8');
}

/**
 * Create the README page (in HTML) from the plugin's README.md file.
 * This includes the same header, nav bar, and footer as the playground page for a
 * given package.
 * 
 * @param {string} pluginDir The directory of the plugin that is currently being prepared.
 */
function createReadmePage(pluginDir) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const initialContents = fs.readFileSync(`./plugins/${pluginDir}/README.md`).toString();

  const converter = new showdown.Converter();
  converter.setFlavor('github');
  const text = initialContents;
  const html = converter.makeHtml(text);

  let initialPage = `<!DOCTYPE html>
  <head>
    <title></title>
  </head>
  <body class="root">
    <main id="main" class="has-tabs">
    <article class="article-container site-width">
      <div class="article">
      ${html}
      </div>
    </article>
    </main>
  </body>
 </html>
  `;

  // Add the same header, nav bar, and footer as we used for the playground.
  let title = `${packageJson.name} Demo`;
  let modifiedContents = injectHeader(initialPage, title);
  modifiedContents = injectPluginNavBar(modifiedContents, packageJson, pluginDir);
  modifiedContents = injectFooter(modifiedContents);

  // Make sure the directory exists, then write to it.
  const dirString = `./gh-pages/plugins/${pluginDir}/`;
  fs.mkdirSync(dirString, { recursive: true });
  const outputPath = `${dirString}/README.html`;

  fs.writeFileSync(outputPath, modifiedContents, 'utf-8');
}

/**
 * Copy over files needed to deploy this plugin and its test page to 
 * github pages.
 * @param {string} pluginDir The directory with the plugin source files.
 * @returns 
 */
function preparePlugin(pluginDir) {
  console.log(`Preparing ${pluginDir} plugin for deployment.`);
  createPluginPage(pluginDir);
  createReadmePage(pluginDir);
  return gulp.src(
    [
      './plugins/' + pluginDir + '/build/test_bundle.js',
    ],
    { base: './plugins/', allowEmpty: true })
    .pipe(gulp.dest('./gh-pages/plugins/'));
}

/**
 * Prepare plugins for deployment to gh-pages.
 *
 * For each plugin, copy relevant files to the gh-pages directory.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareToDeployPlugins(done) {
  const dir = 'plugins';
  const folders = fs.readdirSync(dir).filter(function (file) {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
      fs.existsSync(path.join(dir, file, 'package.json')) &&
      // Only prepare plugins with test pages.
      fs.existsSync(path.join(dir, file, '/test/index.html'));
  });
  return gulp.parallel(folders.map(function (folder) {
    return function preDeployPlugin() {
      return preparePlugin(folder);
    };
  }))(done);
}


/**
 * Inject nav bar HTML for a specific example at the beginning of the body.
 * @param {string} inputString The initial page HTML, as a string.
 * @param {!Object} packageJson The contents of the example's package.json.
 * @param {string} pageRoot The location of the example's files relative to the root of
 *     the repository.
 * @param {string} title The title to display in the nav bar.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectExampleNavBar(inputString, packageJson, pageRoot, title) {
  // Build up information from package.json.
  let description = packageJson.blocklyDemoConfig.description ?
      `<div class="subtitle">${ packageJson.blocklyDemoConfig.description}</div>` : ``;
  let codeLink = `https://github.com/google/blockly-samples/blob/master/${pageRoot}`;

  const pages = packageJson.blocklyDemoConfig.pages;
  const tabString = pages ? createExampleTabs(pageRoot, pages) : '';
  let baseurl = '/blockly-samples';
  // Assemble that information into a nav bar and tabs for getting to linked
  // example pages.
  let navBar = `
  <!-- NAV BAR -->
  <nav id="toolbar">
    <a href="${baseurl}" id="arrow-back">
      <i class="material-icons">close</i>
      <img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
        alt="Blockly sample" />
    </a>

    <div class="title-grow">
      <div class="title">${title}</div>
      ${description}
    </div>
    
    <a href="${codeLink}" class="button" target="_blank">View code</a>
  </nav>
  <!-- END NAV BAR -->
  ${tabString}`

  // Find the start of the body and inject the nav bar just after the opening <body> tag,
  // preserving anything else in the tag (such as onload).
  // Also wrap all page content in a <main></main> tag.
  let modifiedContent = inputString.replace(
      /<body([^>]*)>/,
      `<body$1 class="root">
      <main id="main" class="has-tabs">${navBar}`
      );
  modifiedContent = modifiedContent.replace(/<\/body>/, `</main>\n  </body>`);
  return modifiedContent;
}

/**
 * Inject appropriate headers and footers into the input HTML page so
 * that it will display nicely on gh-pages. This includes a
 * devsite-style header and footer, links to the source files, and links
 * to other files within the same demo package.
 * @param {string} pageRoot The directory of the example that is currently being
 *     prepared (e.g. examples/interpreter-demo).
 * @param {string} pagePath The page of the page to create within the example's directory
 *     (e.g. index.html).
 */
function createExamplePage(pageRoot, pagePath) {
  const packageJson = require(resolveApp(`${pageRoot}/package.json`));
  const initialContents = fs.readFileSync(path.join(pageRoot, pagePath)).toString();

  const { blocklyDemoConfig } = packageJson;

  let contents = injectHeader(initialContents, blocklyDemoConfig.title);
  contents = injectExampleNavBar(contents, packageJson, pageRoot, blocklyDemoConfig.title);
  contents = injectFooter(contents);

  const outputPath = path.join('gh-pages', pageRoot, pagePath);

  fs.writeFileSync(outputPath, contents, 'utf-8');
}

/**
 * Copy over files listed in the blocklyDemoConfig.files section of the
 * package.json. Add variables needed for Jekyll processing.
 * The resulting code lives in gh-pages/examples/<exampleName>.
 * @param {string} baseDir The base directory to use, eg: ./examples.
 * @param {string} exampleDir The subdirectory (inside examples/) for this
 *     example.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareExample(baseDir, exampleDir, done) {
  // TODO: Why do I sometimes use path.join and sometimes just do
  // string concatenation?
  const packageJson =
    require(resolveApp(path.join(baseDir, exampleDir, 'package.json')));
  
  // Cancel early if the package.json says this is not a demo.
  const { blocklyDemoConfig } = packageJson;
  if (!blocklyDemoConfig) {
    done();
    return;
  }
  console.log(`Preparing ${exampleDir} example for deployment.`);

  const fileList = blocklyDemoConfig.files;

  // Create target folder, if it doesn't exist.
  fs.mkdirSync(path.join('gh-pages', baseDir, exampleDir), { recursive: true });

  // Special case: do a straight copy for the devsite demo, with no wrappers.
  if (packageJson.name == 'blockly-devsite-demo') {
    return gulp.src(
      fileList.map((f) => path.join(baseDir, exampleDir, f)),
        { base: baseDir, allowEmpty: true })
      .pipe(gulp.dest('./gh-pages/examples/'));
  }

  // All other examples.
  const pageRegex = /.*\.(html|htm)$/i;
  const pages = fileList.filter((f) => pageRegex.test(f));
  // Add headers and footers to HTML pages.
  pages.forEach(page => createExamplePage(`${baseDir}/${exampleDir}`, page));
  
  // Copy over all other files mentioned in the demoConfig to the correct directory.
  const assets = fileList.filter((f) => !pageRegex.test(f));
  let stream;
  if (assets.length) {
    stream = gulp.src(
      assets.map((f) => path.join(baseDir, exampleDir, f)),
      { base: baseDir, allowEmpty: true });
  }
  return stream.pipe(gulp.dest('./gh-pages/examples/'));
}

/**
 * Prepare examples/demos for deployment to gh-pages.
 *
 * For each examples, read the demo config, and copy relevant files to the
 * gh-pages directory.
 * @param {Function} done Completed callback.
 * @return {Function} Gulp task.
 */
function prepareToDeployExamples(done) {
  const dir = 'examples';
  const folders = fs.readdirSync(dir).filter((file) => {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
      fs.existsSync(path.join(dir, file, 'package.json'));
  });
  return gulp.parallel(folders.map(function (folder) {
    return function preDeployExample(done) {
      return prepareExample(dir, folder, done);
    };
  }))(done);
}

/**
 * Create the index page for the blockly-samples GitHub Pages site.
 * This page has some nice wrappers, a search bar, and a link to every plugin or example
 * specified in in `index.md`.
 */
function createIndexPage() {
  const initialContents = fs.readFileSync(`./gh-pages/index.md`).toString();

  const converter = new showdown.Converter();
  converter.setFlavor('github');
  const htmlContents = converter.makeHtml(initialContents);

  const indexBase = `<!DOCTYPE html>
<html lang="en-US">

<head>
  <meta charset='utf-8'>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,maximum-scale=2">
  <link rel="stylesheet" href="https://blocklycodelabs.dev/styles/main.css" />
</head>

<body class="root">
  <!-- HEADER -->
  <nav id="toolbar">
    <div class="site-width layout horizontal">
      <a href="https://google.github.io/blockly-samples/"><img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
          alt="Blockly" /></a>
      <div id="searchbar">
        <div class="input-container">
          <div prefix="" icon="search" role="button" tabindex="0" aria-disabled="false" class="icon">
            <div class="icon-search">
              <i class="material-icons">search</i>
            </div>
          </div>
          <input is="iron-input" autofocus id="search-box" placeholder="Search" />
        </div>
      </div>
    </div>
    <a class="button" href="https://github.com/google/blockly-samples">View on GitHub</a>
  </nav>
  <main id="main" class="index">
    <div class="drop-shadow"></div>
    <header id="banner">
      <div class="site-width">
        <h2 class="banner-title">Welcome to blockly-samples!</h2>
        <p>
          Sample projects demonstrating how to integrate Blockly into your project
        </p>
      </div>
    </header>
    <div class="site-width">
      <div class="container">
        ${htmlContents}
      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js"></script>
  <script src="js/index.js"></script>
</body>

</html>
`;

  let contents = injectHeader(indexBase, 'Plugins | blockly-samples');
  contents = injectFooter(contents);

  const outputPath = path.join('gh-pages', 'index.html');

  fs.writeFileSync(outputPath, contents, 'utf-8');
}

/**
 * Create pages for examples, plugins, and the index page to display on
 * GitHub Pages.
 */
function predeployForGitHub(done) {
  createIndexPage();
  return gulp.parallel(prepareToDeployPlugins, prepareToDeployExamples)(done);
}

module.exports = {
  predeployPlugins: prepareToDeployPlugins,
  predeployExamples: prepareToDeployExamples,
  prepareIndex: createIndexPage,
  predeployAll: predeployForGitHub,
};
