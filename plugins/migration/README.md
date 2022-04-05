---
title: "@blockly/migrate Demo"
packageName: "@blockly/migrate"
description: "A collection of tools that help with migrating apps using Blockly to new versions of BLockly."
pageRoot: "plugins/migration"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/migrate [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A collection of tools that help with migrating apps built on [Blockly](https://www.npmjs.com/package/blockly) to new versions of Blockly.

## Example Usage

```
npx @blockly/migrate rename --from 6 ./path/to/my/files*
npx @blockly/migrate rename --from 6 --to 7 ./path/to/my/files*
```

Use `help` subcommand for more info.

```
npx @blockly/migrate help
npx @blockly/migrate help 6
```

## License
Apache 2.0
