/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Speaker used for speaking out text.
 */

import * as Blockly from 'blockly';

/**
 * Convenience methods for speaking out text.
 * More information on speakers can be found here:
 * https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis.
 */
export class Speaker {
  /**
   * Constructor for a speaker.
   * @param {SpeakerMessages=} optMessages Optional messages for the speaker.
   */
  constructor(optMessages) {
    const messages = {
      'MAIN_WS': 'On the main workspace',
      'STACK':
          'On a stack of blocks. Use the in key to navigate to the top block',
      'PREVIOUS': 'On a connection before block, ',
      'NEXT': 'On a connection after, ',
      'OUTPUT': 'On an output connection',
      'CONNECTION':
          'At a connection point. Mark this connection to' +
          'add a block to this position',
      'BLOCK': 'On a block of type',
      'CLICKABLE_FIELD': 'To interact with the field hit enter.',
      'EMPTY_TOKEN': 'blank',
      'MARK_CONNECTION': 'To mark the block press enter',
    };

    Blockly.utils.object.mixin(messages, optMessages);

    this.setLocale(messages);
  }

  /**
   * The messages to be read out by a screen reader.
   * @typedef {{
   *     MAIN_WS: string,
   *     STACK: string,
   *     PREVIOUS: string,
   *     NEXT: string,
   *     OUTPUT: string,
   *     CONNECTION: string,
   *     BLOCK: string,
   *     EMPTY_TOKEN: string,
   *     MARK_CONNECTION: string,
   * }} SpeakerMessages
   */

  /**
   * Set the messages for the speaker.
   * @param {!SpeakerMessages} messages The messages needed to create a speaker.
   */
  setLocale(messages) {
    Object.keys(messages).forEach((k) => {
      Blockly.Msg[k] = messages[k];
    });
  }

  /**
   * Speaks out the text that was given to it.
   * @param {string} text The text to speak out.
   * @param {boolean=} shouldCancel True to stop the current utterance, false to
   *     wait until the current utterance is done before speaking.
   * @param {function=} onEnd The function to run after the text has been
   *     spoken.
   * @param {function=} onStart The function run when the text has begun to
   *     be spoken.
   * @public
   */
  speak(text, shouldCancel, onEnd, onStart) {
    const audio = new SpeechSynthesisUtterance(text);

    if (shouldCancel && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (onEnd) {
      audio.onend = onEnd;
    }

    if (onStart) {
      audio.onstart = onStart;
    }
    window.speechSynthesis.speak(audio);
  }

  /**
   * Speaks out text if the event is of type marker or cursor move.
   * @param {!Blockly.Events} event The event to speak out.
   */
  eventToSpeach(event) {
    // TODO: Update this if we link to the current version of blockly.
    if (event.element === 'cursorMove' || event.element === 'markerMove') {
      let nodeText = this.nodeToText_(event.newValue,
          event.element === 'markerMove');
      if (event.element === 'markerMove') {
        nodeText = 'Marker moved to location, ' + nodeText;
      }
      this.speak(nodeText, true);
    }
  }

  /**
   * Speaks out an audio representation of the given node.
   * @param {Blockly.ASTNode} node The node to speak out.
   * @param {boolean} isMarker True to get the text for a marker,
   *     false otherwise.
   * @return {string} The text representation of the node.
   * @public
   */
  nodeToText_(node, isMarker) {
    switch (node.getType()) {
      case Blockly.ASTNode.types.FIELD:
        return this.fieldNodeToText_(node);
      case Blockly.ASTNode.types.BLOCK:
        return this.blockNodeToText_(node);
      case Blockly.ASTNode.types.INPUT:
        return this.inputNodeToText_(node);
      case Blockly.ASTNode.types.OUTPUT:
        return this.outputNodeToText_(node);
      case Blockly.ASTNode.types.NEXT:
        return this.nextNodeToText_(node);
      case Blockly.ASTNode.types.PREVIOUS:
        return this.previousNodeToText_(node, isMarker);
      case Blockly.ASTNode.types.STACK:
        return this.stackNodeToText_(node);
      case Blockly.ASTNode.types.WORKSPACE:
        return this.workspaceNodeToText_(node);
      default:
        return node.toString();
    }
  }

  /**
   * Get the text for the source block of the node.
   * @param {!Blockly.ASTNode} node The node to get the text for.
   * @return {string} The text describing the source block of the node.
   * @private
   */
  getBlockText_(node) {
    const srcBlock = node.getSourceBlock();
    if (srcBlock) {
      return srcBlock.toString(null, Blockly.Msg['EMPTY_TOKEN']);
    } else {
      return '';
    }
  }

  /**
   * Creates text for a feild.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  fieldNodeToText_(node) {
    const field = node.getLocation();
    let text = field.getText();
    if (field.isClickable()) {
      // TODO: This should get the mark key from the keymap.
      text += '. To interact with the field hit enter.';
    }
    return text;
  }

  /**
   * Creates text for a feild.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  blockNodeToText_(node) {
    const block = /** @type{Blockly.BlockSvg} */ (node.getLocation());
    return `${Blockly.Msg['BLOCK']} ${block.type}`;
  }

  /**
   * Creates text for an input.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  inputNodeToText_(node) {
    const blockText = this.getBlockText_(node);
    const inputConnection = /** @type{Blockly.Input} */ (node.getLocation());
    if (inputConnection.type == Blockly.NEXT_STATEMENT) {
      return `Inside ${blockText}. ${Blockly.Msg['CONNECTION']}`;
    } else if (inputConnection.type == Blockly.INPUT_VALUE) {
      return Blockly.Msg['CONNECTION'];
    }
  }

  /**
   * Creates text for a output connection.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  outputNodeToText_(node) {
    return `${Blockly.Msg['OUTPUT']}`;
  }

  /**
   * Creates text for a next connection.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @param {boolean} isMarker True to get the text for a marker,
   *     false otherwise.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  nextNodeToText_(node, isMarker) {
    const blockText = this.getBlockText_(node);
    let finalText = `${Blockly.Msg['NEXT']} ${blockText}`;
    if (!isMarker) {
      finalText += `! . ${Blockly.Msg['MARK_CONNECTION']}`;
    }
    return finalText;
  }

  /**
   * Creates text for a previous connection.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @param {boolean} isMarker True to get the text for a marker,
   *     false otherwise.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  previousNodeToText_(node, isMarker) {
    const blockText = this.getBlockText_(node);
    let finalText = `${Blockly.Msg['PREVIOUS']} ${blockText}`;
    if (!isMarker) {
      finalText += `! . ${Blockly.Msg['MARK_CONNECTION']}`;
    }
    return finalText;
  }

  /**
   * Creates text for a stack of blocks.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  stackNodeToText_(node) {
    return Blockly.Msg['STACK'];
  }

  /**
   * Creates text for a workspace.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  workspaceNodeToText_(node) {
    const workspace = /** @type{Blockly.WorkspaceSvg} */ (node.getLocation());
    // TODO: All text should be added to Blockly.Msg to allow for translation.
    let text = null;
    if (workspace.isFlyout) {
      text = 'In the flyout, please select a block';
    } else if (workspace.isMutator) {
      text = 'In the mutator workspace, use this workspace to change a block';
    } else {
      text = Blockly.Msg['MAIN_WS'];
    }
    return text;
  }
}

export const speaker = new Speaker();
