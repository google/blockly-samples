[Home](../README.md)

# blockly-umd-sample [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This sample shows how to load Blockly using the UMD built package ``blockly.min.js``, which can be retrieved either from npm ``npm install blockly`` or through [Unpkg](https://unpkg.com/).

A note about the built UMD module: Being UMD, you are able to load it in either in an AMD environment (RequireJS), or a CommonJS environment, or it falls back to load the Blockly object globally. This means you're able to use this package in most environments. 

However, the package we publish contains all the defaults (Blockly core, blocks, the JavaScript generator and the EN lang files). If you need more flexibility, you'll want to take a look at some of the other samples for direction on how to integrate specific Blockly modules into your environment.

## Installation

```
npm install
```

## Running

```
npm run start
```

## Browse

- [http://localhost:3000/index.html](http://localhost:3000/index.html): references the UMD module bundle directly from node_modules.
- [http://localhost:3000/unpkg.html](http://localhost:3000/unpkg.html): references the UMD module bundle from [Unpkg](https://unpkg.com/) at ``https://unpkg.com/blockly@3.20191014.1/blockly.min.js``. 
- [http://localhost:3000/custom.html](http://localhost:3000/custom.html): references specific UMD modules directly from node_modules. Blockly core, blocks, the JavaScript generator and the French locale.