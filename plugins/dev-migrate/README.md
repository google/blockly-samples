# @blockly/migrate [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A command to help migrate to newer versions of Blockly.

These commands will usually make changes directly to your files to fix breaking
changes. For example, renaming all of your usages of a property that has been
renamed.

## Example Usage
```
npx @blockly/migrate 6 7.2
npx @blockly/migrate 6 7.2 -r
npx @blockly/migrate 6 7.2 -l blocks
```

Use the `--help` option for more info.
```
npx @blockly/migrate --help
```

## License

Apache 2.0
