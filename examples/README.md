# Blockly Examples

This directory includes self-contained sample projects demonstrating techniques
to include and extend the [Blockly](http://github.com/google/blockly) library.

## Samples

### Integrating Blockly
- [``blockly-requirejs-sample``](examples/blockly-requirejs/): Loads RequireJS from a CDN and loads Blockly using ``AMD``.
- [``blockly-umd-sample``](examples/blockly-umd/): Loads the UMD build of Blockly (``blockly.min.js``), both from node_modules and from Unpkg.
- [``blockly-webpack-sample``](blockly-webpack/): Using Blockly in Webpack.
- [``blockly-node-sample``](examples/blockly-node/): Using Blockly in Node.js, loaded using require (``CommonJS``).
- [``blockly-angular-sample``](examples/blockly-angular/): Blockly in an Angular project, defines an Angular Blockly Component.
- [``blockly-react-sample``](examples/blockly-react/): Blockly in a React project, defines a React Blockly Component.
- [``blockly-svelte-sample``](examples/blockly-svelte/): Blockly in a Svelte project, defines a Svelte Blockly Component.
- [``blockly-vue-sample``](examples/blockly-vue/): Blockly in a Vue project, defines a Vue Blockly Component.

### Real-time Collaboration

- [``blockly-rtc``](examples/blockly-rtc/): Real-time collaboration environment on top of the Blockly framework.

## Prerequisites

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
