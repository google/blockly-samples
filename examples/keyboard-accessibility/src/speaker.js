/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Speaker used for speaking out text.
 */

import Blockly from 'blockly/core';

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
          'To go to the last block in the previous group of blocks, press up. To go to the first block in the stack hit next.',
      'PREVIOUS': 'On a connection before block, ',
      'NEXT': 'On a connection after, ',
      'OUTPUT': 'On an output connection. ',
      'CONNECTION': 'At a connection point.',
      'BLOCK': 'On a block of type',
      'CLICKABLE_FIELD': 'To interact with the field hit enter.',
      'EMPTY_TOKEN': 'blank',
      'MARK_CONNECTION': 'To mark the block press enter. ',
      'EXIT_EDIT_MODE': 'To exit edit mode hit escape. ',
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
   * Clears out the queue of text to speak.
   * @public
   */
  cancel() {
    window.speechSynthesis.cancel();
  }

  /**
   * Pauses speaking.
   */
  pause() {
    window.speechSynthesis.pause();
  }

  /**
   * Resumes speaking.
   */
  resume() {
    window.speechSynthesis.resume();
  }

  /**
   * Speaks out text if the event is of type marker or cursor move.
   * @param {!Blockly.Events} event The event to speak out.
   */
  nodeToSpeech(event) {
    // TODO: Update this if we link to the current version of blockly.
    if (event.type === Blockly.Events.MARKER_MOVE) {
      let nodeText = this.nodeToText_(event.newNode, event.oldNode, !event.isCursor);
      if (!event.isCursor) {
        nodeText = `You have marked a location. To find a block to connect to this location hit T. ! . To insert a block on the workspace, find the location of the block and hit I. `;
      }
      this.speak(nodeText, true);
    }
  }

  /**
   * Speaks out the text for a modal.
   * @param {Element} modal The modal to collect the text to read out.
   * @public
   */
  modalToText(modal) {
    const header = modal.querySelector('header');
    const headerText = header.textContent.trim();
    if (headerText !== '') {
      this.speak(headerText);
    }
    this.addButtonListeners_(header.querySelectorAll('button'));

    const mainText = modal.querySelector('main').textContent.trim();

    if (mainText !== '') {
      this.speak(mainText);
    }

    const footerBtns = modal.querySelector('footer').querySelectorAll('button');
    this.addButtonListeners_(footerBtns);
  }

  /**
   * Adds listeners for when the button is focused.
   * @param {!NodeList} btns The buttons to add listeners to.
   * @private
   */
  addButtonListeners_(btns) {
    for (const btn of btns) {
      btn.addEventListener('focus', () => {
        this.buttonToSpeech_(btns, btn, true);
      });
      if (document.activeElement === btn) {
        this.buttonToSpeech_(btns, btn, false);
      }
    }
  }

  /**
   * Speaks out information about a button.
   * @param {NodeList} btns The list of buttons on the modal.
   * @param {Element} btn The button.
   * @param {boolean} shouldCancel True if this should cancel the previous
   *     utterance.
   * @private
   */
  buttonToSpeech_(btns, btn, shouldCancel) {
    this.speak('Hit enter to ', shouldCancel);
    if (btn.textContent === '') {
      this.speak(btn.getAttribute('aria-label'));
    } else {
      this.speak(btn.textContent);
    }
    if (btns.length > 0) {
      this.speak('Hit tab to go to your next option');
    }
  }

  /**
   * Speaks out an audio representation of the given node.
   * @param {Blockly.ASTNode} node The node to speak out.
   * @param {Blockly.ASTNode} oldNode The previous node to speak out.
   * @param {boolean} isMarker True to get the text for a marker,
   *     false otherwise.
   * @return {string} The text representation of the node.
   * @public
   */
  nodeToText_(node, oldNode, isMarker) {
    let finalText = '';
    switch (node.getType()) {
      case Blockly.ASTNode.types.FIELD:
        finalText = this.fieldNodeToText_(node);
        break;
      case Blockly.ASTNode.types.BLOCK:
        finalText = this.blockNodeToText_(node);
        break;
      case Blockly.ASTNode.types.INPUT:
        finalText = this.inputNodeToText_(node, isMarker);
        break;
      case Blockly.ASTNode.types.OUTPUT:
        finalText = this.outputNodeToText_(node, isMarker);
        break;
      case Blockly.ASTNode.types.NEXT:
        finalText = this.nextNodeToText_(node, isMarker);
        break;
      case Blockly.ASTNode.types.PREVIOUS:
        finalText = this.previousNodeToText_(node, isMarker);
        break;
      case Blockly.ASTNode.types.STACK:
        finalText = this.stackNodeToText_(node, oldNode);
        break;
      case Blockly.ASTNode.types.WORKSPACE:
        finalText = this.workspaceNodeToText_(node);
        break;
      default:
        return node.toString();
    }
    finalText += this.getNextOptions_(node, oldNode, isMarker);
    return finalText;
  }

  /**
   *
   * @param node
   * @param oldNode
   * @param isMarker
   * @private
   */
  getNextOptions_(node, oldNode, isMarker) {
    switch (node.getType()) {
      case Blockly.ASTNode.types.FIELD:
        return this.getFieldOptions_(node);
      case Blockly.ASTNode.types.BLOCK:
        return this.getBlockOptions_(node);
      case Blockly.ASTNode.types.INPUT:
        return this.getConnectionOptions_(node, isMarker);
      case Blockly.ASTNode.types.OUTPUT:
        return this.getConnectionOptions_(node, isMarker);
      case Blockly.ASTNode.types.NEXT:
        return this.getConnectionOptions_(node, isMarker);
      case Blockly.ASTNode.types.PREVIOUS:
        return this.getConnectionOptions_(node, isMarker);
      case Blockly.ASTNode.types.STACK:
        return '';
      case Blockly.ASTNode.types.WORKSPACE:
        return '';
      default:
        return node.toString();
    }
  }

  getFieldOptions_(node) {
    const field = node.getLocation();
    if (field.isClickable()) {
      return 'To interact with the field hit enter. ';
    }
    return '';
  }

  getBlockOptions_() {
    return ` To edit this block press, e. To go to the next block press next.`;
  }

  getConnectionOptions_(node, isMarker) {
    const markerText = '. To connect a block to this location, hit enter. ';
    let finalText = '';
    if (!isMarker) {
      finalText += `${markerText}`;
    }
    // finalText += `${Blockly.Msg['EXIT_EDIT_MODE']}`;
    return finalText;
  }

  /**
   * Get the text for the source block of the node.
   * @param {!Blockly.BlockSvg} srcBlock The block to get the text for.
   * @return {string} The text describing the source block of the node.
   * @private
   */
  getBlockText_(srcBlock) {
    let emptyToken = Blockly.Msg['EMPTY_TOKEN'];
    if (srcBlock) {
      if (srcBlock.statementInputCount > 0) {
        emptyToken = ' do blank ';
      }
      return srcBlock.toString(null, emptyToken);
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
    return field.getText() + '. ';
  }

  /**
   * Creates text for a feild.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  blockNodeToText_(node) {
    const block = /** @type{Blockly.BlockSvg} */ (node.getLocation());
    const blockText = this.getBlockText_(block);
    let finalText = '';
    if (block.getSurroundParent()) {
      const parentBlockText = this.getBlockText_(block.getSurroundParent());
      finalText += `You are inside of block ${parentBlockText}. . `;
    }
    finalText += `You are on block, ${blockText}. . `;
    return finalText;
  }

  /**
   * Creates text for an input.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  inputNodeToText_(node, isMarker) {
    const blockText = this.getBlockText_(node.getSourceBlock());
    const inputConnection = /** @type{Blockly.Input} */ (node.getLocation());
    const connectionText = `You are on a connection. `;
    let finalText = '';
    if (inputConnection.type === Blockly.NEXT_STATEMENT) {
      finalText = `Inside ${blockText}. ${connectionText}`;
    } else if (inputConnection.type === Blockly.INPUT_VALUE) {
      finalText = `${connectionText}`;
    }
    return finalText;
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
    const blockText = this.getBlockText_(node.getSourceBlock());
    let finalText = `${Blockly.Msg['NEXT']} ${blockText}`;
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
    const blockText = this.getBlockText_(node.getSourceBlock());
    let finalText = `${Blockly.Msg['PREVIOUS']} ${blockText}`;
    return finalText;
  }

  /**
   * Creates text for a stack of blocks.
   * @param {!Blockly.ASTNode} node The node to create text for.
   * @param {!Blockly.ASTNode} oldNode The previous node.
   * @return {string} The text for the screen reader to read out.
   * @protected
   */
  stackNodeToText_(node, oldNode) {
    const srcBlock = node.getSourceBlock();
    const newNodeTopBlock = srcBlock.getTopStackBlock();
    let oldNodeTopBlock = null;
    if (oldNode && oldNode.getSourceBlock()) {
      oldNodeTopBlock = oldNode.getSourceBlock().getTopStackBlock();
    }

    let finalText = '';

    if (srcBlock && srcBlock.workspace.isFlyout) {
      finalText = this.getBlockText_(node.getSourceBlock());
      finalText += ' . . To add this block to the workspace press Enter. . To go to the next block hit next. . To go back to the workspace hit escape. ';
    } else if (srcBlock) {
      if (oldNodeTopBlock !== newNodeTopBlock) {
        finalText += `You are on a new group of blocks. `;
      } else {
        finalText += `You are on a group of blocks. `;
      }
      finalText += Blockly.Msg['STACK'];
    }
    return finalText;
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
