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
 * Inject head HTML for a plugin demo page on gh-pages.
 * This looks for the end of the existing head tag and inserts a few additional lines of CSS,
 * as well as updating the title to match the plugin's name.
 * @returns {string} The modified contents of the page, as a string.
 */
function injectHeader(initialContents, packageJson) {
  let baseurl = '/blockly-samples';

  let headerAdditions = `  <meta name="viewport" content="width=device-width,maximum-scale=2">
  <link rel="icon" type="image/x-icon" href="${baseurl}/favicon.ico" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="${baseurl}/css/custom.css" />
  <link rel="stylesheet" href="https://blocklycodelabs.dev/styles/main.css" />`;

  // Replace the title with a more descriptive title.
  let modifiedContents = initialContents.replace(/<title>.*<\/title>/, `<title>${packageJson.name} Demo</title>`);
  // Add some CSS.
  modifiedContents = modifiedContents.replace(/(<\s*\/\s*head\s*>)/, `${headerAdditions}$1`);
  return modifiedContents;
}

/**
 * Create footer HTML for a plugin demo page on gh-pages.
 * @returns {string} The footer HTML, as a string.
 */
function injectFooter(initialContents) {
  let footer = `<!-- FOOTER  -->
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
 `
 // Insert the footer at the end of the body.
 return initialContents.replace(/(<\s*\/\s*body\s*>)/, `${footer}$1`)
}

/**
 * Inject nav bar HTML for a specific plugin
 * @param {!Object} packageJson 
 * @param {string} pluginDir 
 * @returns 
 */
function injectNavBar(inputString, packageJson, pluginDir) {
  // Build up information from package.json.
  let title = `${packageJson.name} Demo`;
  let description = packageJson.description;
  let version = packageJson.version;
  let codeLink = `https://github.com/google/blockly-samples/blob/master/plugins/${pluginDir}`;

  let npmLink = `https://www.npmjs.com/package/${packageJson.name}`;
  // TODO: get rid of the NPM link if there's no package name
  // Or possible just return early if there's no package name?
  let baseurl = '/blockly-samples';

  // Assemble that information into a nav bar.
  let navBar = `<nav id="toolbar">
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
    <a href="https://www.npmjs.com/package/${packageJson.name}" class="button" target="_blank">View on npm</a>
  </nav>`
  
  const pageTabs = createPageTabs(packageJson, pluginDir);
  // Find the start of the body and inject the nav bar just after the opening <body> tag,
  // preserving anything else in the tag (such as onload).
  let modifiedContents = inputString.replace(/(<body.*>)/, `$1${navBar}${pageTabs}`);
  return modifiedContents;
}

function addContent() {
  return '';
}

/**
 * Create HTML for a single tab.
 * @param {*} tabInfo 
 * @param {*} pluginDir 
 * @returns 
 */
function createTab(tabInfo, pluginDir) {
  let pageRoot = `plugins/${pluginDir}`;
  return `<li>
  <a href="/blockly-samples/${pageRoot}/${tabInfo.link}">
    ${tabInfo.label}
  </a>
</li>`;
}

/**
 * Create HTML for tabs for the playground and README pages.
 * @param {!Object} packageJson 
 * @param {string} pluginDir 
 * @returns 
 */
function createPageTabs(packageJson, pluginDir) {
  let pages = [
    { label: 'Playground', link: 'test/index' },
    { label: 'README', link: 'README'}
  ];
  let tabString = `<!-- PAGE TABS -->
  <ul id="tabs">`;
  for (const page of pages) {
    tabString += createTab(page, pluginDir);
  }
  tabString += '</ul>';
  return tabString;
}

/**
 * Create the index.html page for the plugin's page on github pages.
 * This page has the plugin's test playground, but wraps it in a 
 * devsite-style header and footer, and includes the plugin's readme and 
 * links to the plugin source files on GitHub and published package on npm.
 * @param {string} pluginDir 
 */
function createPage(pluginDir) {
  const packageJson = require(resolveApp(`plugins/${pluginDir}/package.json`));
  const initialContents = fs.readFileSync(`./plugins/${pluginDir}/test/index.html`).toString();

  let modifiedContents = injectHeader(initialContents, packageJson);
  modifiedContents = injectNavBar(modifiedContents, packageJson, pluginDir);
  modifiedContents = injectFooter(modifiedContents);

  const dirString = `./gh-pages/plugins/${pluginDir}/test`;
  fs.mkdirSync(dirString, { recursive: true});
  const outputPath = `${dirString}/index.html`;
  console.log('writing to ' + outputPath);

  fs.writeFileSync(outputPath, modifiedContents, 'utf-8');
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

  const showdown  = require('showdown');
  const converter = new showdown.Converter();
  converter.setFlavor('github');
  const text      = initialContents;
  const html      = converter.makeHtml(text);

  let initialPage = `<!DOCTYPE html>
  
  <head>
    <title></title>
  </head>
  <body>
    <article class="article-container site-width">
      <div class="article">
      ${html}
      </div>
    </article>
  </body>
 </html>
  `;

  // Add the same header, nav bar, and footer as we used for the playground.
  let modifiedContents = injectHeader(initialPage, packageJson);
  modifiedContents = injectNavBar(modifiedContents, packageJson, pluginDir);
  modifiedContents = injectFooter(modifiedContents);

  // Make sure the directory exists, then write to it.
  const dirString = `./gh-pages/plugins/${pluginDir}/`;
  fs.mkdirSync(dirString, { recursive: true});
  const outputPath = `${dirString}/README.html`;
  console.log('writing to ' + outputPath);

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
  createPage(pluginDir);
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
      // Only prepare plugins with text pages.
      fs.existsSync(path.join(dir, file, '/test/index.html'));
  });
  return gulp.parallel(folders.map(function (folder) {
    return function preDeployPlugin() {
      return preparePlugin(folder);
    };
  }))(done);
}

module.exports = {
    predeployPlugins: prepareToDeployPlugins,
};