
// Define a custom renderer that extends the base renderer.
CustomRenderer = function(name) {
  CustomRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomRenderer,
    Blockly.blockRendering.Renderer);

// Register your renderer by name.
Blockly.blockRendering.register('custom_renderer', CustomRenderer);
