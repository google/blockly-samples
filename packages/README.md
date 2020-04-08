# @blockly Packages

This directory is where [Blockly](http://github.com/google/blockly) extension
packages such as plugins and fields are authored and stored. These packages are
released to npm under the ``@blockly`` scope.

A full list of published packages can be found by searching for the ``@blockly``
tag on [npm](https://www.npmjs.com/search?q=%40blockly).

## Packages

### Plugins

- [``@blockly/plugin-workspace-search``](plugins/workspace-search/): A plugin
that adds workspace search support.

### Fields

- [``@blockly/field-date``](fields/field-date/): A date picker field that uses
the Google Closure date picker.
- [``@blockly/field-slider``](fields/field-slider/): A slider field.

### Dev

- [``@blockly/create-package``](dev/create/): A tool for creating a Blockly
package based on a pre-existing template.
- [``@blockly/dev-tool``](dev/tools/): A library of common utilities for Blockly
 extension development.
- [``@blockly/dev-scripts``](dev/scripts/): Configuration and scripts for
Blockly packages.


## Using Lerna

[Lerna](https://lerna.js.org/) is being used to manage all the packages released
under the ``@blockly`` npm scope.

When you first check out the repo, or if additional packages are added, run
``npm run boot`` from the project root to bootstrap all packages.

Once you've bootstrapped the packages, you no longer need to run ``npm install``
in each of the packages.
