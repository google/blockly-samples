# Blockly Custom Tooltips Demo [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This is a demo of the custom tooltip API. This isn't a plugin that can be installed and it shouldn't be copied directly. It is an example of how you can register a custom function to render tooltips.

## API

Create a function that takes two parameters. The first is the div element to render the tooltip DOM into. The second is the element being moused over. You can get the tooltip string for the element by calling `Blockly.Tooltip.getTooltipOfObject(element)`. Do any custom logic you like to render the tooltip into the given div. Register your function with Blockly by calling `Blockly.Tooltip.setCustomTooltip(yourFunction)`. Your function will be called instead of the default rendering logic whenever a tooltip should be shown.

## License
Apache 2.0
