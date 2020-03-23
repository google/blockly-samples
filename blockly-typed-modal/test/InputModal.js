
class InputModal extends TypedModal {
  /**
   * The element holding the input type.
   * @override
   */
  createVariableTypeContainer_(types) {
    const selectDiv = document.createElement('select');
    for (const type of types) {
      const displayName = type[0];
      const typeName = type[1];
      const option = document.createElement('option');
      option.classList.add('input-modal-type');
      option.value = typeName;
      option.innerText = displayName;
      selectDiv.appendChild(option);
    }
    this.firstTypeInput_ = selectDiv.querySelector('.input-modal-type');
    return selectDiv;
  }

  /**
   * Get the selected type.
   * @return {string} The selected type.
   */
  getSelectedType() {
    const selectDiv = this.variableTypesDiv_;
    return selectDiv.options[selectDiv.selectedIndex].value;
  }

  /**
   * Get the first type in the list.
   * @private
   */
  checkFirstType_() {
    this.firstTypeInput_.selected = true;
  }

  /**
   * Add an extra button to the footer.
   */
  createDom() {
    super.createDom();
    const randomBtn = document.createElement('button');
    Blockly.utils.dom.addClass(randomBtn, 'blockly-modal-btn');
    randomBtn.innerText = 'Create random name';
    this.addEvent_(randomBtn,'click',this, ()=> this.randomName());
    this.footerDiv_.appendChild(randomBtn);
  }

  /**
   * Create a random name for the variable.
   */
  randomName() {
    this.variableNameInput_.value = 'Random Name';
  }
}
