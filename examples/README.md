# Blockly Examples

This directory includes self-contained sample projects demonstrating techniques
to include and extend the [Blockly](http://github.com/google/blockly) library.

## Samples

### Usage Demos

- [``backpack-demo``](backpack-demo/): A demo of two Blockly instances with a shared backpack.
- [``custom-dialogs-demo``](custom-dialogs-demo/): A demo overriding Blockly browser dialogs with custom implementations.
- [``custom-tooltips-demo``](custom-tooltips-demo/): An example of using a custom tooltip renderer.
- [``fixed-demo``](fixed-demo/): A demo injecting Blockly into a page as a fixed element.
- [``generator-demo``](generator-demo/): A demo of generating code from blocks and running it in a sandboxed JavaScript interpreter
- [``graph-demo``](graph-demo/): A demo of giving instant feedback as blocks are changed.
- [``headless-demo``](headless-demo/): A demo of generating Python code from XML with no graphics.
- [``interpreter-demo``](interpreter-demo/): A demo of executing code step-by-step with a sandboxed JavaScript interpreter.
- [``max-blocks-demo``](max-blocks-demo/): A demo limiting the total number of blocks allowed for academic exercises.
- [``mirror-demo``](mirror-demo/): A demo using two Blockly instances connected as leader-follower.
- [``pitch-field-demo``](pitch-field-demo/): A demo of creating custom block fields.
- [``resizable-demo``](resizable-demo/): A demo of injecting Blockly into a page as a resizable element.
- [``rtl-demo``](rtl-demo/): A demo of what Blockly looks like in right-to-left mode (for Arabic and Hebrew).
- [``single-direction-scroll-demo``](single-direction-scroll-demo/): A demo of configuring single-direction scrollbars.
- [``toolbox-demo``](toolbox-demo/): A demo of a complex category structure for the toolbox.
- [``turtle-field-demo``](turtle-field-demo/): A demo of creating custom block fields.

### Codelabs

The [Blockly Codelabs](https://blocklycodelabs.dev/) refer to this example code.

- [``context-menu-codelab``](context-menu-codelab/): Starter code and completed code for the [codelab](https://blocklycodelabs.dev/codelabs/context-menu-option/index.html) on context menu options.
- [``custom-toolbox-codelab``](custom-toolbox-codelab/): Starter code and completed code for the [codelab](https://blocklycodelabs.dev/codelabs/custom_toolbox/index.html) on how to customize your toolbox.
- [``getting-started-codelab``](getting-started-codelab/): Code for the [Blockly getting started codelab](https://blocklycodelabs.dev/codelabs/getting-started/index.html).
- [``theme-extension-codelab``](theme-extension-codelab/): Starter code and completed code for the [codelab](https://blocklycodelabs.dev/codelabs/theme-extension-identifier/index.html) on applying themes.
- [``validation-and-warnings-codelab``](validation-and-warnings-codelab/): Starter code and completed code for the [codelab](https://blocklycodelabs.dev/codelabs/validation-and-warnings/index.html) on validating blocks and displaying warnings.

### Integrating Blockly

- [``blockly-requirejs-sample``](blockly-requirejs/): Loads RequireJS from a CDN and loads Blockly using ``AMD``.
- [``blockly-umd-sample``](blockly-umd/): Loads the UMD build of Blockly (``blockly.min.js``), both from node_modules and from Unpkg.
- [``blockly-webpack-sample``](blockly-webpack/): Using Blockly in Webpack.
- [``blockly-node-sample``](blockly-node/): Using Blockly in Node.js, loaded using require (``CommonJS``).
- [``blockly-angular-sample``](blockly-angular/): Blockly in an Angular project, defines an Angular Blockly Component.
- [``blockly-react-sample``](blockly-react/): Blockly in a React project, defines a React Blockly Component.
- [``blockly-svelte-sample``](blockly-svelte/): Blockly in a Svelte project, defines a Svelte Blockly Component.
- [``blockly-vue-sample``](blockly-vue/): Blockly in a Vue project, defines a Vue Blockly Component.
- [``blockly-vue3-sample``](blockly-vue3/): Blockly in a Vue3 project, defines a Vue Blockly Component.
- [``blockly-parcel``](blockly-parcel/): Using Blockly with Parcel.

### Real-time Collaboration

- [``blockly-rtc``](blockly-rtc/): Real-time collaboration environment on top of the Blockly framework.

## Prerequisites

Install [node](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm).

## Running

```
cd <any sample folder>
npm install
npm run start
```
Browse to http://localhost:3000

You may need to refer to a sample's README for further setup and running instructions.

## Development

### Bootstrap

```
npm run boot
```
This will run ``npm install`` on every example.

### Maintenance

```
npm run update
```
This will run ``npm update`` on every example.


```
npm run audit
```
This will run ``npm audit fix`` on every example.
