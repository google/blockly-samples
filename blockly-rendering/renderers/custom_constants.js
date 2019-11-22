
CustomConstantsRenderer = function(name) {
  CustomConstantsRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomConstantsRenderer,
    Blockly.blockRendering.Renderer);

Blockly.blockRendering.register('custom_constants',
    CustomConstantsRenderer);

// Define a custom constants provider that extends the base constants provider.
CustomConstantsProvider = function() {
  // Set up all of the constants from the base provider.
  CustomConstantsProvider.superClass_.constructor.call(this);

  // Override a few properties.
  this.NOTCH_WIDTH = 20;
  this.NOTCH_HEIGHT = 10;
  this.CORNER_RADIUS = 2;
  this.TAB_HEIGHT = 8;
};
Blockly.utils.object.inherits(CustomConstantsProvider,
    Blockly.blockRendering.ConstantProvider);

// Tell the custom renderer to use the custom constants provider instead of the
// base constants provider.
CustomConstantsRenderer.prototype.makeConstants_ = function() {
  return new CustomConstantsProvider();
};
