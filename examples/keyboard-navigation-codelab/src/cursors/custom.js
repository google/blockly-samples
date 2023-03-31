import * as Blockly from 'blockly/core';

export class CustomCursor extends Blockly.Cursor {
  constructor() {
    super();
  }

  next() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.next();
    // While the newNode exists and is either a previous or next type go to the
    // next value.
    while (newNode && (newNode.getType() === Blockly.ASTNode.types.PREVIOUS ||
        newNode.getType() === Blockly.ASTNode.types.NEXT)) {
      newNode = newNode.next();
    }
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  in() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.in();
    // If the newNode is a previous connection go to the next value in the
    // level.  This will be the block.
    if (newNode && newNode.getType() === Blockly.ASTNode.types.PREVIOUS) {
      newNode = newNode.next();
    }
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  prev() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.prev();
    // While the newNode exists and is either a previous or next connection go
    // to the previous value.
    while (newNode && (newNode.getType() === Blockly.ASTNode.types.PREVIOUS ||
        newNode.getType() === Blockly.ASTNode.types.NEXT)) {
      newNode = newNode.prev();
    }
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  out() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = curNode.out();
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }
}
