import * as Blockly from 'blockly/core';

class CustomMarkerSvg extends Blockly.blockRendering.MarkerSvg {
  constructor(workspace, constants, marker) {
    super(workspace, constants, marker);
  }

  /**
   * @override
   */
  createDomInternal_() {
    super.createDomInternal_();

    // Create the svg element for the marker when it is on a block and set the
    // parent to markerSvg_.
    this.blockPath_ = Blockly.utils.dom.createSvgElement(
        'path', {}, this.markerSvg_);

    // If this is a cursor make the cursor blink.
    if (this.isCursor()) {
      const blinkProperties = this.getBlinkProperties_();
      Blockly.utils.dom.createSvgElement('animate', blinkProperties,
          this.blockPath_);
    }
  }

  showWithBlock_(curNode) {
    // Get the block from the AST Node
    const block = curNode.getLocation();

    // Get the path of the block.
    const blockPath = block.pathObject.svgPath.getAttribute('d');

    // Set the path for the cursor.
    this.blockPath_.setAttribute('d', blockPath);

    // Set the current marker.
    this.currentMarkerSvg = this.blockPath_;

    // Set the parent of the cursor as the block.
    this.setParent_(block);

    // Show the current marker.
    this.showCurrent_();
  }

  /**
   * @override
   */
  showAtLocation_(curNode) {
    let handled = false;
    // If the cursor is on a block call the new method we created to draw the
    // cursor.
    if (curNode.getType() == Blockly.ASTNode.types.BLOCK) {
      this.showWithBlock_(curNode);
      handled = true;
    }

    // If we have not drawn the cursor let the parent draw it.
    if (!handled) {
      super.showAtLocation_.call(this, curNode);
    }
  }

  /**
   * @override
   */
  hide() {
    super.hide();
    // Hide the marker we created.
    this.blockPath_.style.display = 'none';
  }
}

class CustomRenderer extends Blockly.geras.Renderer {
  constructor(name) {
    super(name);
  }

  makeMarkerDrawer(workspace, marker) {
    return new CustomMarkerSvg(workspace, this.getConstants(), marker);
  }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer);
