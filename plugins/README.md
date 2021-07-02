# @blockly Plugins

This directory is where [Blockly](http://github.com/google/blockly) plugins are
authored and stored. These plugin packages are released to npm under the
``@blockly`` scope.

A full list of published packages can be found by searching for the ``@blockly``
tag on [npm](https://www.npmjs.com/search?q=%40blockly).

## Plugins

### Fields

- [``@blockly/field-date``](field-date/): A date picker field that uses the
Google Closure date picker.
- [``@blockly/field-grid-dropdown``](field-grid-dropdown/): A Blockly dropdown
field with grid layout.
- [``@blockly/field-slider``](field-slider/): A slider field.

### Blocks

- [``@blockly/block-plus-minus``](block-plus-minus/): A group of blocks that
replace the built-in mutator UI with a +/- based UI.
- [``@blockly/block-dynamic-connection``](block-dynamic-connection/): A group of
blocks that add connections dynamically.
- [``@blockly/block-test``](block-test/): A group of Blockly test blocks.

### Dev

- [``@blockly/create-package``](dev-create/): A tool for creating a Blockly
plugin based on a pre-existing template.
- [``@blockly/eslint-config``](eslint-config/): ESlint configuration used by
Blockly plugins.
- [``@blockly/dev-tool``](dev-tools/): A library of common utilities for Blockly
plugin development.
- [``@blockly/dev-scripts``](dev-scripts/): Configuration and scripts for Blockly
plugins.

### Themes

- [``@blockly/theme-modern``](theme-modern/): A Blockly modern theme.
- [``@blockly/theme-dark``](theme-dark/): A Blockly dark theme.

### Block Extension

- [``@blockly/block-extension-tooltip``](block-extension-tooltip/): A Blockly
block extension that adds support for custom tooltip rendering.

### Workspace

- [``@blockly/continuous-toolbox``](continuous-toolbox/): A Blockly plugin
that adds a continous-scrolling style toolbox and flyout.
- [``@blockly/workspace-content-highlight``](content-highlight/):  A Blockly
plugin that highlights the content on the workspace.
- [``@blockly/disable-top-blocks``](disable-top-blocks/):  A Blockly plugin that
shows the 'disable' context menu option only on non-orphan blocks.
- [``@blockly/fixed-edges``](fixed-edges/):  A Blockly MetricsManager for
configuring fixed sides.
- [``@blockly/keyboard-navigation``](keyboard-navigation/): A Blockly plugin
that adds keyboard navigation support.
- [``@blockly/plugin-nominal-connection-checker``](nominal-connection-checker/):
A Blockly plugin for creating more advanced connection checks, targeted at
nominally typed languages (private; in development).
- [``@blockly/plugin-strict-connection-checker``](strict-connection-checker/): A
Blockly plugin that makes connection checks strict.
- [``@blockly/plugin-workspace-search``](workspace-search/): A plugin that adds
workspace search support.
- [``@blockly/zoom-to-fit``](zoom-to-fit/): A Blockly plugin that adds a
zoom-to-fit control to the workspace.

### Other

- [``@blockly/plugin-modal``](modal/): A Blockly plugin that creates a modal.
- [``@blockly/plugin-typed-variable-modal``](typed-variable-modal/): A plugin to
create a modal for creating typed variables.

## Using Lerna

[Lerna](https://lerna.js.org/) is being used to manage all the packages released
under the ``@blockly`` npm scope.

When you first check out the repo, or if additional packages are added, run
``npm run boot`` from the project root to bootstrap all packages.

Once you've bootstrapped the packages, you no longer need to run ``npm install``
in each of the packages.
