#!/usr/bin/env node
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script for creating Blockly packages based on pre-existing
 * templates.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const scriptPackageJson = require('../package.json');

const pluginTypes = ['plugin', 'field', 'block', 'theme'];

const root = process.cwd();
const scriptName = scriptPackageJson.name;

let pluginName;

const program = new commander.Command(scriptName)
    .version(scriptPackageJson.version)
    .arguments('<plugin-name>')
    .action((name) => {
      pluginName = name;
    })
    .usage(`${chalk.green('<plugin-name>')} [options]`)
    .option('-d, --dir <directory-name>',
        `specify the directory name to use`)
    .option('-t, --type <plugin-type>',
        `specify the type of the plugin. One of ${pluginTypes.join(', ')}`)
    .option('--typescript', 'use typescript')
    .option('--author <author>', 'author, eg: Blockly Team')
    .option('--skip-install')
    .parse(process.argv);

// Check package name.
if (!pluginName) {
  console.error(`Please specify the plugin name:`);
  console.log(`  ${chalk.blue(scriptName)} ${chalk.green('<plugin-name>')}
 
For example:\n  ${chalk.blue(scriptName)}\
  ${chalk.green('my-blockly-plugin')}\n`);
  process.exit(1);
}

// Default to type=plugin.
const pluginType = program.type || 'plugin';
// Default to the plugin name if the type=plugin, otherwise use [type]-[name].
const pluginDir = program.dir ||
    (pluginType == 'plugin' ? pluginName : `${pluginType}-${pluginName}`);
const pluginPath = path.join(root, pluginDir);
const pluginAuthor = program.author || 'Blockly Team';

const isTypescript = program.typescript;
const skipInstall = program.skipInstall;

// Check plugin type.
if (!pluginTypes.includes(pluginType)) {
  console.error(`Unknown plugin type: ${chalk.red(pluginType)}`);
  console.log(`Available types: ${chalk.green(pluginTypes.join(', '))}`);
  process.exit(1);
}

// Check plugin directory doesn't already exist.
if (pluginPath != root) { // Allow creating a plugin in current directory '.'.
  if (fs.existsSync(pluginPath)) {
    console.error(`Package directory already exists,\
   delete ${chalk.red(pluginDir)} and try again.`);
    process.exit(1);
  } else {
    // Create the plugin directory.
    fs.mkdirSync(pluginPath);
  }
}

console.log(`Creating a new Blockly\
 ${chalk.green(pluginType)} in ${chalk.green(pluginDir)}.\n`);

const templateDir =
    `../templates/${isTypescript ? 'typescript-' : ''}${pluginType}/`;
const templateJson = require(path.join(templateDir, 'template.json'));

const gitRoot = execSync(`git rev-parse --show-toplevel`).toString().trim();
const gitURL = execSync(`git config --get remote.origin.url`).toString().trim();
const gitPluginPath =
  path.join(path.relative(gitRoot, root), pluginDir);

const pluginPackageName = `@blockly/${pluginType}-${pluginName}`;

const packageJson = {
  name: pluginPackageName,
  version: `0.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.0`,
  description: templateJson.description || `A Blockly ${pluginType}.`,
  scripts: templateJson.scripts || {
    'build': 'blockly-scripts build',
    'clean': 'blockly-scripts clean',
    'dist': 'blockly-scripts build prod',
    'lint': 'blockly-scripts lint',
    'prepublishOnly': 'npm run clean && npm run dist',
    'start': 'blockly-scripts start',
  },
  main: './dist/index.js',
  module: './src/index.js',
  unpkg: './dist/index.js',
  author: pluginAuthor,
  keywords: [
    'blockly',
    'blockly-plugin',
    pluginType != 'plugin' && `blockly-${pluginType}`,
    pluginName].filter(Boolean),
  homepage: `${gitURL}/tree/master/${gitPluginPath}#readme`,
  bugs: {
    url: `${gitURL}/issues`,
  },
  repository: {
    'type': 'git',
    'url': `${gitURL}.git`,
    'directory': gitPluginPath,
  },
  license: 'Apache 2.0',
  directories: {
    'dist': 'dist',
    'src': 'src',
  },
  files: [
    'dist',
    'src',
  ],
  devDependencies: { },
  peerDependencies: templateJson.peerDependencies || {
    'blockly': '>=3.20200123.0',
  },
  publishConfig: {
    'access': 'public',
    'registry': 'https://wombat-dressing-room.appspot.com',
  },
  engines: {
    'node': '>=8.17.0',
  },
  browserslist: [
    'defaults',
    'IE 11',
    'IE_Mob 11',
  ],
};

// Add dev dependencies.
const devDependencies = ['blockly', '@blockly/dev-scripts']
    .concat(Object.keys(templateJson.devDependencies));
devDependencies.sort().forEach((dep) => {
  const latestVersion = execSync(`npm show ${dep} version`).toString();
  packageJson.devDependencies[dep] = `^${latestVersion.trim()}`;
});

// Write the package.json to the new package.
fs.writeFileSync(path.join(pluginPath, 'package.json'),
    JSON.stringify(packageJson, null, 2));

// Write the README.md to the new package.
let readme = fs.readFileSync(path.resolve(__dirname, templateDir, 'README.md'),
    'utf-8');
readme = readme.replace(/@blockly\/plugin/gmi, `${pluginPackageName}`);
fs.writeFileSync(path.join(pluginPath, 'README.md'), readme, 'utf-8');

// Copy the rest of the template folder into the new package.
fs.copySync(path.resolve(__dirname, templateDir, 'template'), pluginPath);

// Run npm install.
if (!skipInstall) {
  console.log('Installing packages. This might take a couple of minutes.');
  execSync(`cd ${pluginDir} && npm install`, {stdio: [0, 1, 2]});
}

console.log(chalk.green('\nPackage created.\n'));
console.log('Next steps, run:');
console.log(chalk.blue(`  cd ${pluginDir}`));
if (skipInstall) {
  console.log(chalk.blue(`  npm install`));
}
console.log(chalk.blue(`  npm start`));
console.log(`Search ${chalk.red(`'TODO'`)} to see remaining tasks.`);

process.exit(1);
