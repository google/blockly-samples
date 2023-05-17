/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks for preparing plugins for deployment
 * to github pages.
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
 * @param {string} initialContents The initial page HTML, as a string.
 * @param {string} title The title to use for the page, which may be
 *     generated from the package name or specified explicitly.
 * @param {boolean} isLocal True if building for a local test. False
 *     if building for gh-pages.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectHeader(initialContents, title, isLocal) {
  const baseURL = isLocal ? '/' : '/blockly-samples/';

  const headerAdditions = `
  <!-- INJECTED HEADER -->
  <meta name="viewport" content="width=device-width,maximum-scale=2">
  <link rel="icon" type="image/x-icon" href="${baseURL}favicon.ico" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="${baseURL}css/custom.css"/>
  <!-- END INJECTED HEADER -->`;

  // Replace the title with a more descriptive title.
  let modifiedContents = initialContents.replace(
      /<title>.*<\/title>/, `<title>${title}</title>`);
  // Add some CSS at the beginning of the header. Any CSS the page already
  // had will be higher priority.
  modifiedContents = modifiedContents.replace(
      /<\s*head\s*>/, `<head>${headerAdditions}`);
  return modifiedContents;
}

/**
 * Inject footer HTML into a page at the end of the body.
 * @param {string} initialContents The initial page HTML, as a string.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectFooter(initialContents) {
  const footer = `
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
  return initialContents.replace(/(<\s*\/\s*body\s*>)/, `${footer}$1`);
}

/**
 * Inject nav bar HTML for a specific plugin at the beginning of the body.
 * @param {string} inputString The initial page HTML, as a string.
 * @param {!Object} packageJson The contents of the plugin's package.json.
 * @param {string} pluginDir The directory of the plugin that is currently
 *     being prepared.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectPluginNavBar(inputString, packageJson, pluginDir, isLocal) {
  const codeLink = `https://github.com/google/blockly-samples/blob/master/plugins/${pluginDir}`;
  const npmLink = `https://www.npmjs.com/package/${packageJson.name}`;
  const baseURL = isLocal ? '/' : '/blockly-samples/';

  const navBar = `
  <!-- NAV BAR -->
  <nav id="toolbar">
    <a href="${baseURL}" id="arrow-back">
      <i class="material-icons">close</i>
      <img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
        alt="Blockly logo" />
    </a>

    <div class="title-grow">
      <div class="title">${packageJson.name} Demo</div>
      <div class="subtitle">${packageJson.description}</div>
    </div>
    ${packageJson.version}
    
    <a href="${codeLink}" class="button" target="_blank">View code</a>
    <a href="${npmLink}" class="button" target="_blank">View on npm</a>
  </nav>
  <!-- END NAV BAR -->`;

  const tabs = `
  <!-- PAGE TABS -->
  <ul id="tabs">
    <li>
      <a href="${baseURL}plugins/${pluginDir}/test/index">
        Playground
      </a>
    </li>
    <li>
      <a href="${baseURL}plugins/${pluginDir}/README">
        README
      </a>
    </li>
  </ul>
  <!-- END PAGE TABS -->`;

  // Find the start of the body and inject the nav bar just after the opening
  // <body> tag, preserving anything else in the tag (such as onload).
  // Also wrap all page content in a <main></main> tag.
  let modifiedContent = inputString.replace(
      /<body([^>]*)>/,
      `<body$1 class="root">
    ${navBar}
    <main id="main" class="has-tabs">
      <div class="drop-shadow"></div>
      ${tabs}
      `
  );
  modifiedContent = modifiedContent.replace(/(<\/body>)/, `</main>$1`);
  return modifiedContent;
}

/**
 * Create the tabs for switching between pages in an example.
 * The pages to include are specified in the example's package.json.
 * Unlike plugins, examples may have as many tabs as they want.
 * @param {string} pageRoot The directory of the example that is currently
 *     being prepared.
 * @param {Array<Object>} pages The list of pages to make tabs for.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 * @returns {string} The HTML for the page tabs, as a string.
 */
function createExampleTabs(pageRoot, pages, isLocal) {
  const baseURL = isLocal ? '/' : '/blockly-samples/';

  let tabsString = ``;
  for (const page of pages) {
    tabsString += `
    <li>
      <a href="${baseURL}${pageRoot}/${page.link}">
        ${page.label}
      </a>
    </li>
    `;
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
 * @param {string} pluginDir The directory of the plugin that is currently
 *     being prepared.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 */
function createPluginPage(pluginDir, isLocal) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const initialPath = path.join('plugins', pluginDir, 'test', 'index.html');
  const initialContents = fs.readFileSync(initialPath).toString();

  let contents = injectHeader(
      initialContents, `${packageJson.name} Demo`, isLocal);
  contents = injectPluginNavBar(contents, packageJson, pluginDir, isLocal);
  contents = injectFooter(contents);

  const dirPath = path.join('gh-pages', 'plugins', pluginDir, 'test');
  fs.mkdirSync(dirPath, {recursive: true});
  fs.writeFileSync(path.join(dirPath, 'index.html'), contents, 'utf-8');
}

/**
 * Create the README page (in HTML) from the plugin's README.md file.
 * This includes the same header, nav bar, and footer as the playground page
 * for a given package.
 *
 * @param {string} pluginDir The directory of the plugin that is currently
 *     being prepared.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 */
function createReadmePage(pluginDir, isLocal) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const initialContents =
      fs.readFileSync(`./plugins/${pluginDir}/README.md`).toString();

  const converter = new showdown.Converter();
  converter.setFlavor('github');
  // By default, showdown preserves line breaks from the README file that are
  // just there to stay under 80 characters per line. Turn that off.
  converter.setOption('simpleLineBreaks', false);
  converter.setOption('ghMentions', false);
  const text = initialContents;
  const html = converter.makeHtml(text);

  const initialPage = `<!DOCTYPE html>
  <head>
    <title></title>
  </head>
  <body class="root">
    <article class="article-container site-width">
      <div class="article">
      ${html}
      </div>
    </article>
  </body>
 </html>
  `;

  // Add the same header, nav bar, and footer as we used for the playground.
  let modifiedContents = injectHeader(
      initialPage, `${packageJson.name} Demo`, isLocal);
  modifiedContents = injectPluginNavBar(
      modifiedContents, packageJson, pluginDir, isLocal);
  modifiedContents = injectFooter(modifiedContents);

  // Make sure the directory exists, then write to it.
  const dirString = `./gh-pages/plugins/${pluginDir}/`;
  fs.mkdirSync(dirString, {recursive: true});
  fs.writeFileSync(`${dirString}/README.html`, modifiedContents, 'utf-8');
}

/**
 * Copy over files needed to deploy this plugin and its test page to
 * github pages.
 * @param {string} pluginDir The directory with the plugin source files.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 * @returns {*} gulp stream
 */
function preparePlugin(pluginDir, isLocal) {
  console.log(`Preparing ${pluginDir} plugin for deployment.`);
  createPluginPage(pluginDir, isLocal);
  createReadmePage(pluginDir, isLocal);
  return gulp.src(
      [
        './plugins/' + pluginDir + '/build/test_bundle.js',
      ],
      {base: './plugins/', allowEmpty: true})
      .pipe(gulp.dest('./gh-pages/plugins/'));
}

/**
 * Find the folders that contain plugins with test pages.
 *
 * @returns {Array.string} A list of directories that should be processed
 *   for deployment to GitHub Pages.
 */
function getPluginFolders() {
  const dir = 'plugins';
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
      fs.existsSync(path.join(dir, file, 'package.json')) &&
      // Only prepare plugins with test pages.
      fs.existsSync(path.join(dir, file, '/test/index.html'));
  });
}

/**
 * Prepare plugins for deployment to gh-pages.
 *
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function prepareToDeployPlugins(done) {
  const folders = getPluginFolders();
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployPlugin() {
      return preparePlugin(folder, false);
    };
  }))(done);
}

/**
 * Prepare plugins for local testing of the GitHub Pages site.
 *
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function prepareLocalPlugins(done) {
  const folders = getPluginFolders();
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployPlugin() {
      return preparePlugin(folder, true);
    };
  }))(done);
}

/**
 * Inject nav bar HTML for a specific example at the beginning of the body.
 * @param {string} inputString The initial page HTML, as a string.
 * @param {!Object} demoConfig The contents of the blocklyDemoConfig object
 *     in the example's package.json.
 * @param {string} pageRoot The location of the example's files relative to
 *     the root of the repository.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectExampleNavBar(inputString, demoConfig, pageRoot, isLocal) {
  // Build up information from package.json.
  const descriptionString = demoConfig.description ?
      `<div class="subtitle">${demoConfig.description}</div>` : ``;
  const codeLink = `https://github.com/google/blockly-samples/blob/master/${pageRoot}`;

  const pages = demoConfig.pages;
  const tabString = pages ? createExampleTabs(pageRoot, pages, isLocal) : '';
  const indexURL = isLocal ? '/' : '/blockly-samples';
  // Assemble that information into a nav bar and tabs for getting to linked
  // example pages.
  const navBar = `
  <!-- NAV BAR -->
  <nav id="toolbar">
    <a href="${indexURL}" id="arrow-back">
      <i class="material-icons">close</i>
      <img src="https://blocklycodelabs.dev/images/logo_knockout.png" class="logo-devs"
        alt="Blockly sample" />
    </a>

    <div class="title-grow">
      <div class="title">${demoConfig.title}</div>
      ${descriptionString}
    </div>
    
    <a href="${codeLink}" class="button" target="_blank">View code</a>
  </nav>
  <!-- END NAV BAR -->`;

  // Find the start of the body and inject the nav bar just after the opening
  // <body> tag, preserving anything else in the tag (such as onload).
  // Also wrap all page content in a <main></main> tag.
  let modifiedContent = inputString.replace(
      /<body([^>]*)>/,
      `<body$1 class="root">
      ${navBar}
      <main id="main" class="has-tabs">
        <div class="drop-shadow"></div>
        ${tabString}
        `
  );
  modifiedContent = modifiedContent.replace(/<\/body>/, `</main>\n  </body>`);
  return modifiedContent;
}

/**
 * Inject appropriate headers and footers into the input HTML page so
 * that it will display nicely on gh-pages. This includes a
 * devsite-style header and footer, links to the source files, and links
 * to other files within the same demo package.
 * @param {string} pageRoot The directory of the example that is currently
 *     being prepared (e.g. examples/interpreter-demo).
 * @param {string} pagePath The path of the page to create within the example's
 *     directory (e.g. index.html).
 * @param {!Object} demoConfig The contents of the blocklyDemoConfig object
 *     in the example's package.json.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 */
function createExamplePage(pageRoot, pagePath, demoConfig, isLocal) {
  const initialContents =
      fs.readFileSync(path.join(pageRoot, pagePath)).toString();

  let contents = injectHeader(initialContents, demoConfig.title, isLocal);
  contents = injectExampleNavBar(contents, demoConfig, pageRoot, isLocal);
  contents = injectFooter(contents);

  const outputPath = path.join('gh-pages', pageRoot, pagePath);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, contents, 'utf-8');
}

/**
 * Copy over files listed in the blocklyDemoConfig.files section of the
 * package.json and create the demo HTML pages.
 * The resulting code lives in gh-pages/examples/<exampleName>.
 * @param {string} exampleDir The subdirectory (inside examples/) for this
 *     example.
 * @param {boolean} isLocal True if building for a local test. False if
 *     building for gh-pages.
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function prepareExample(exampleDir, isLocal, done) {
  const baseDir = 'examples';
  const packageJson =
    require(resolveApp(path.join(baseDir, exampleDir, 'package.json')));

  // Cancel early if the package.json says this is not a demo.
  const {blocklyDemoConfig: demoConfig} = packageJson;
  if (!demoConfig) {
    done();
    return;
  }
  console.log(`Preparing ${exampleDir} example for deployment.`);

  const fileList = demoConfig.files;

  // Create target folder, if it doesn't exist.
  fs.mkdirSync(path.join('gh-pages', baseDir, exampleDir), {recursive: true});

  // Special case: do a straight copy for the devsite demo, with no wrappers.
  if (packageJson.name == 'blockly-devsite-demo') {
    return gulp.src(
        fileList.map((f) => path.join(baseDir, exampleDir, f)),
        {base: baseDir, allowEmpty: true})
        .pipe(gulp.dest('./gh-pages/examples/'));
  }

  // All other examples.
  const pageRegex = /.*\.(html|htm)$/i;
  const pages = fileList.filter((f) => pageRegex.test(f));
  // Add headers and footers to HTML pages.
  pages.forEach((page) =>
    createExamplePage(`${baseDir}/${exampleDir}`, page, demoConfig, isLocal)
  );

  // Copy over all other files mentioned in the demoConfig to the
  // correct directory.
  const assets = fileList.filter((f) => !pageRegex.test(f));
  let stream;
  if (assets.length) {
    stream = gulp.src(
        assets.map((f) => path.join(baseDir, exampleDir, f)),
        {base: baseDir, allowEmpty: true});
  }
  return stream.pipe(gulp.dest('./gh-pages/examples/'));
}

/**
 * Find the folders in examples that have package.json files.
 * @returns {Array<string>} A list of directories to prepare.
 */
function getExampleFolders() {
  const dir = 'examples';
  return fs.readdirSync(dir).filter((file) => {
    return fs.statSync(path.join(dir, file)).isDirectory() &&
      fs.existsSync(path.join(dir, file, 'package.json'));
  });
}
/**
 * Prepare examples/demos for deployment to gh-pages.
 *
 * For each examples, read the demo config, and copy relevant files to the
 * gh-pages directory.
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function prepareToDeployExamples(done) {
  const folders = getExampleFolders();
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployExample(done) {
      return prepareExample(folder, false, done);
    };
  }))(done);
}

/**
 * Prepare examples/demos for local testing of the GitHub Pages site.
 *
 * @param {Function} done Completed callback.
 * @returns {Function} Gulp task.
 */
function prepareLocalExamples(done) {
  const folders = getExampleFolders();
  return gulp.parallel(folders.map(function(folder) {
    return function preDeployExample(done) {
      return prepareExample(folder, true, done);
    };
  }))(done);
}

/**
 * Create the index page for the blockly-samples GitHub Pages site.
 * This page has some nice wrappers, a search bar, and a link to every
 * plugin or example specified in in `index.md`.
 *
 * @param {boolean} isLocal True if building for a local test. False if
 *   building for gh-pages.
 */
function createIndexPage(isLocal) {
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

  let contents = injectHeader(indexBase, 'Plugins | blockly-samples', isLocal);
  contents = injectFooter(contents);
  const outputPath = path.join('gh-pages', 'index.html');
  fs.writeFileSync(outputPath, contents, 'utf-8');
}

/**
 * Create pages for examples, plugins, and the index page to display on
 * GitHub Pages.
 * @param {Function} done gulp callback
 * @returns {*} gulp task
 */
function predeployForGitHub(done) {
  createIndexPage(false);
  return gulp.parallel(prepareToDeployPlugins, prepareToDeployExamples)(done);
}

/**
 * Create pages for examples, plugins, and the index page for
 * local testing of the GitHub Pages site.
 * @param {Function} done gulp callback
 * @returns {*} gulp task
 */
function predeployForLocal(done) {
  createIndexPage(true);
  return gulp.parallel(prepareLocalPlugins, prepareLocalExamples)(done);
}

module.exports = {
  predeployPlugins: prepareToDeployPlugins,
  predeployExamples: prepareToDeployExamples,
  prepareIndex: createIndexPage,
  predeployAll: predeployForGitHub,
  predeployAllLocal: predeployForLocal,
};
