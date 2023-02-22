# @blockly/eslint-config [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

> ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) used by [Blockly plugins](https://github.com/google/blockly-samples/tree/master/plugins)

## Installation

```bash
npm install --save-dev eslint @blockly/eslint-config
```

## About

This configuration is specific to Blockly and blockly-samples style rules. In
general, we follow the Google
[JavaScript](https://google.github.io/styleguide/jsguide.html) and
[TypeScript](https://google.github.io/styleguide/tsguide.html) style guides, but
not entirely, due to the existence of code that predates Google's current
recommendations. This configuration also does not match the core Blockly repo's
configuration in an effort to make sure new sample code follows the more modern
guidelines.

The top-level `rules` section contains rules that apply to all js and ts files.
The `overrides` section contains an override for TypeScript files that has
TS-specific rules. In some cases, rules in the top-level section are disabled in
favor of their TS-specific counterparts. In general, TS files must adhere to
both sets of rules.

### JsDoc and TsDoc flavors

JS files are set to "closure" flavor of JsDoc using the `eslint-plugin-jsdoc`
[package](https://www.npmjs.com/package/eslint-plugin-jsdoc). This preset
enforces that Google's Closure-style JsDoc rules are used rather than the
non-Google JsDoc rules. One notable departure from the Closure style is that we
use `@returns` rather than `@return`.

TS files are set to the "typescript" flavor in the `eslint-plugin-jsdoc`
settings. This should correspond to TsDoc style, but this plugin provides a
superior experience to that of the `eslint-plugin-tsdoc`
[package](https://www.npmjs.com/package/eslint-plugin-tsdoc), which does not
provide configurable rules.

## License

Apache 2.0
