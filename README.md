# blockly-samples  [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

Sample projects showing how to integrate Blockly into your project.
- [``blockly-requirejs-sample``](blockly-requirejs/README.md): Loads RequireJS from a CDN and loads Blockly using ``AMD``.
- [``blockly-umd-sample``](blockly-umd/README.md): Loads the UMD build of Blockly (``blockly.min.js``), both from node_modules and from Unpkg.
- [``blockly-node-sample``](blockly-node/README.md): Using Blockly in Node.js, loaded using require (``CommonJS``).
- [``blockly-webpack-sample``](blockly-webpack/README.md): Using Blockly in Webpack.
- [``blockly-react-sample``](blockly-react/README.md): Blockly in a React project, defines a React Blockly Component.
- [``blockly-angular-sample``](blockly-angular/README.md): Blockly in an Angular project, defines an Angular Blockly Component.
- [``blockly-vue-sample``](blockly-vue/README.md): Blockly in Vue project, defines Vue Blockly Component.


## Running

In order to run each of the samples, cd into each sample directoy and run: 
```bash
npm install
```

You can then run ``npm run start`` to start a web server. 

All samples are configured to use port ``3000``<br/>
so open [http://localhost:3000](http://localhost:3000) to view each sample in the browser.


## Importing Blockly

When you import ``import * as Blockly from 'blockly';`` you're actually getting the defaults: Blockly core, Blockly built-in blocks, the JavaScript generator and the English lang files. 

If you need more flexibility, you'll want to define your imports more carefully: 

### Blockly Core

```js
import * as Blockly from 'blockly/core';
```

### Blockly build in blocks
```js
import 'blockly/blocks';
```

### Blockly Generators
If your application needs to generate code from the Blockly blocks, you'll want to include a generator.
```js
import 'blockly/python';
```
to import the Python generator, you can also import ``blockly/javascript``, ``blockly/php``, ``blockly/dart`` and ``blockly/lua``.

### Blockly Languages

```js
import * as Fr from 'blockly/msg/fr';
Blockly.setLocale(Fr);
```
To import the French lang files. Once you've imported the specific lang module, you'll also want to set the locale in Blockly.

For a full list of Blockly supported locales, see: [https://github.com/google/blockly/tree/master/msg/js](https://github.com/google/blockly/tree/master/msg/js)


## License

Apache 2.0
