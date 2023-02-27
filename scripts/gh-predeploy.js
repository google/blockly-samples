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
const yaml = require('json-to-pretty-yaml');
gulp.header = require('gulp-header');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/**
 * Inject head HTML for a plugin demo page on gh-pages.
 * This looks for the end of the existing head tag and inserts a few additional lines of CSS,
 * as well as updating the title to match the plugin's name.
 * @param {string} initialContents The initial page HTML, as a string.
 * @param {!Object} packageJson The contents of the plugin's package.json.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectHeader(initialContents, packageJson) {
  let baseurl = '/blockly-samples';

  let headerAdditions = `
  <!-- INJECTED HEADER -->
  <meta name="viewport" content="width=device-width,maximum-scale=2">
  <link rel="icon" type="image/x-icon" href="${baseurl}/favicon.ico" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="${baseurl}/css/custom.css" />
  <link rel="stylesheet" href="https://blocklycodelabs.dev/styles/main.css" />
  <!-- END INJECTED HEADER -->`;

  // Replace the title with a more descriptive title.
  let modifiedContents = initialContents.replace(/<title>.*<\/title>/,
      `<title>${packageJson.name} Demo</title>`);
  // Add some CSS at the end of the header.
  modifiedContents = modifiedContents.replace(/(<\s*\/\s*head\s*>)/,
      `${headerAdditions}$1`);
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
function injectNavBar(inputString, packageJson, pluginDir) {
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
  ${createPageTabs(pluginDir)}`

  // Find the start of the body and inject the nav bar just after the opening <body> tag,
  // preserving anything else in the tag (such as onload).
  // Also wrap all page content in a <main></main> tag.
  let modifiedContent = inputString.replace(
      /(<body.*>)/, `<main id="main" class="has-tabs">$1${navBar}`);
  modifiedContent = modifiedContent.replace(/(<\/body>)/, `</main>$1`);
  return modifiedContent;
}

/**
 * Create the tabs for switching between playground and README pages.
 * @param {string} pluginDir The directory of the plugin that is currently being prepared.
 * @returns {string} The HTML for the page tabs, as a string.
 */
function createPageTabs(pluginDir) {
  return `
  <!-- PAGE TABS -->
  <ul id="tabs">
    <li>
      <a href="/blockly-samples/plugins/${pluginDir}/test/index">
        Playground
      </a>
    </li>
    <li>
      <a href="/blockly-samples/plugins/${pluginDir}/README">
        README
      </a>
    </li>
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
  const initialContents = fs.readFileSync(`./plugins/${pluginDir}/test/index.html`).toString();

  let contents = injectHeader(initialContents, packageJson);
  contents = injectNavBar(contents, packageJson, pluginDir);
  contents = injectFooter(contents);

  const dirString = `./gh-pages/plugins/${pluginDir}/test`;
  fs.mkdirSync(dirString, { recursive: true });
  const outputPath = `${dirString}/index.html`;

  fs.writeFileSync(outputPath, contents, 'utf-8');
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
  let modifiedContents = injectHeader(initialPage, packageJson);
  modifiedContents = injectNavBar(modifiedContents, packageJson, pluginDir);
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
 * Convert json to front matter YAML config.
 * @param {!Object} json The json config.
 * @return {string} The front matter YAML config.
 */
function buildFrontMatter(json) {
  return `---
${yaml.stringify(json)}
---
`;
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
  const packageJson =
    require(resolveApp(path.join(baseDir, exampleDir, 'package.json')));
  const { blocklyDemoConfig } = packageJson;
  if (!blocklyDemoConfig) {
    done();
    return;
  }
  console.log(`Preparing ${exampleDir} example for deployment.`);

  // TODO: Find README files and transform them into HTML.
  // TODO: Inject headers and footers into transformed readme files
  // TODO: Find .html (and .htm?) files and inject necessary headers and footers.
  // TODO: Generate page tabs based on demo config (handle multiple pages, such
  //     as in the interpreter demos).
  // TODO: Don't inject headers and footers in the devsite demo.

  blocklyDemoConfig.pageRoot = `${baseDir}/${exampleDir}`;
  const pageRegex = /.*\.(html|htm|md)$/i;
  const pages = blocklyDemoConfig.files.filter((f) => pageRegex.test(f));

  let stream = gulp.src(
    pages.map((f) => path.join(baseDir, exampleDir, f)),
    { base: baseDir, allowEmpty: true })
    .pipe(gulp.header(buildFrontMatter(blocklyDemoConfig)));
  
  // Copy over all other files mentioned in the demoConfig to the correct directory.
  const assets = blocklyDemoConfig.files.filter((f) => !pageRegex.test(f));
  if (assets.length) {
    stream = stream.pipe(gulp.src(
      assets.map((f) => path.join(baseDir, exampleDir, f)),
      { base: baseDir, allowEmpty: true }));
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

module.exports = {
  predeployPlugins: prepareToDeployPlugins,
  predeployExamples: prepareToDeployExamples,
};