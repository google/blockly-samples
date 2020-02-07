

var oldDropdownApplyColour = Blockly.FieldDropdown.prototype.applyColour;
Blockly.FieldDropdown.prototype.applyColour = function () {
  oldDropdownApplyColour.call(this);
  // Update arrow's colour.
  if (this.sourceBlock_ && this.arrow_) {
    this.arrow_.style.fill = '#000';
  }
};