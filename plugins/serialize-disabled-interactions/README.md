# @blockly/plugin-serialize-disabled-interactions [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin for the JSON
serialization system that serializes blocks which are not deletable,
movable, or editable.

## When to use

### For Blockly versions >= v9.3.0

This plugin is being deprecated, because serializing these disabled-interaction
attributes is now handled by core in versions of Blockly >= v9.3.0.

If you had previously used this plugin to serialize workspaces, you should use
v3.0 of the plugin. This version will deserialize the old saves, but it will no
longer serialize the disabled properties (since that is now handled by core).
Once all  of your saves have been "cleaned" you can safely remove your use of
this plugin.

### For Blockly versions < v9.3.0

This plugin was created because the old XML serialization system supported
serializing these disabled-interaction attributes, but the new JSON system did
not (for versions of Blockly < v9.3.0). For more information about why this
was, see [this forum post](https://groups.google.com/g/blockly/c/eP9PXVfCaHs/m/S4rPmwnTAQAJ).

In v9.3.0 this was changed to fix https://github.com/google/blockly/issues/6793.

It is **strongly** recommended that instead of using this plugin, you upgrade
to a version of Blockly >= v9.3.0. However if that is not possible, you can use
v2.0 of this plugin (as v3.0 does not actually serialize these attributes).

Note that this plugin is being removed in the future, so by newly installing it
now, you will be introducing a dependency you will be forced to remove in the
future if you want to remain up-to-date with core Blockly.
