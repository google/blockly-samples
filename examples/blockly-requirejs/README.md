[Home](../README.md)

# blockly-requirejs-sample [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This sample shows how to load Blockly with [RequireJS](https://requirejs.org/) using ``AMD``.

Note: This sample actually references the Blockly ``UMD`` package built and published to ``npm``, but since it's UMD (Universal), we're able to load that package in an ``AMD`` environment.

## Prerequisites

Install [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/), and make sure you have run `yarn install` from the root of the repo first.

## Running

```
yarn start
```

## Browse

Open [http://localhost:3000/index.html](http://localhost:3000/index.html)

## Browse

- [http://localhost:3000/index.html](http://localhost:3000/index.html): Loads Blockly with all the defaults (JavaScript and English lang).
- [http://localhost:3000/locale.html](http://localhost:3000/locale.html): Loads Blockly with the French locale files.