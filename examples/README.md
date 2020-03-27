# Blockly Examples

This directory includes self-contained sample projects demonstrating techniques
to include and extend the [Blockly](http://github.com/google/blockly) library.

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
