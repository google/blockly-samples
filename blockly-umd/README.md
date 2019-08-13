[Home](../README.md)

# blockly-umd-sample [![Built on Blockly](https://img.shields.io/badge/Built%20on-Blockly-4285F4?style=flat&cacheSeconds=3600&logoWidth=20&labelColor=5F6368&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYXllcl82IiBkYXRhLW5hbWU9IkxheWVyIDYiIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj4KICA8ZGVmcyBpZD0iZGVmczkwMiIvPgogIDxnIGlkPSJnMTAxMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjMuNSAtOCkiPgogICAgPHBhdGggaWQ9InBhdGg5MDYiIGZpbGw9IiM0Mjg1ZjQiIGQ9Ik0yMC4xIDMyQzEzLjQgMzIgOCAzNy40IDggNDQuMVYxNDljMCA2LjcgNS40IDEyLjEgMTIuMSAxMi4xSDI1YTIwIDIwIDAgMCAwIDM4LjUgMEg4NGE4IDggMCAwIDAgOC04VjQwbC04LTh6Ii8+CiAgICA8cGF0aCBpZD0icGF0aDkwOCIgZmlsbD0iI2M4ZDFkYiIgZD0iTTgwIDMyVjg1bC0xNi42LTkuNGEzLjYgMy42IDAgMCAwLTUuNCAzLjF2NDAuN2MwIDIuNyAzIDQuNCA1LjQgM2wxNi42LTkuM1YxNjFoNDUuNGM2LjQgMCAxMS42LTUuMiAxMS42LTExLjV2LTEwNmMwLTYuNC01LjItMTEuNS0xMS41LTExLjV6Ii8+CiAgPC9nPgo8L3N2Zz4K)](https://github.com/google/blockly)

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
- [http://localhost:3000/unpkg.html](http://localhost:3000/unpkg.html): references the UMD module bundle from [Unpkg](https://unpkg.com/) at ``https://unpkg.com/blockly@2.20190722.0/blockly.min.js``. 
- [http://localhost:3000/custom.html](http://localhost:3000/custom.html): references specific UMD modules directly from node_modules. Blockly core, blocks, the JavaScript generator and the French locale.