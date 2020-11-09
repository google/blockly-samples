/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the accessible music demo.
 */

import Blockly from 'blockly/core';
import './field_pitch';

const mediaPrefix =
    'https://raw.githubusercontent.com/google/blockly-games/master/appengine/';

/* eslint-disable quotes */
Blockly.defineBlocksWithJsonArray([
  {
    "type": "pitch_test",
    "message0": 'pitch test: %1',
    "args0": [
      {
        "type": "field_pitch",
        "name": "PITCH",
      },
    ],
    "output": null,
    "colour": 160,
  },
  {
    "type": "music_pitch",
    "message0": "%1",
    "args0": [
      {
        "type": "field_pitch",
        "name": "PITCH",
      },
    ],
    "output": "Number",
    "colourPrimary": 160,
  },
  {
    "type": "music_note",
    "message0": 'Music_playNote %1 %2',
    "args0": [
      {
        "type": "field_dropdown",
        "name": "DURATION",
        "options": [
          [{
            "src": mediaPrefix + "music/note1.png",
            "width": 9, "height": 19, "alt": "whole",
          }, "1"],
          [{
            "src": mediaPrefix + "music/note0.5.png",
            "width": 9, "height": 19, "alt": "half",
          }, "0.5"],
          [{
            "src": mediaPrefix + "music/note0.25.png",
            "width": 9, "height": 19, "alt": "quarter",
          }, "0.25"],
          [{
            "src": mediaPrefix + "music/note0.125.png",
            "width": 9, "height": 19, "alt": "eighth",
          }, "0.125"],
          [{
            "src": mediaPrefix + "music/note0.0625.png",
            "width": 9, "height": 19, "alt": "sixteenth",
          }, "0.0625"],
        ],
      },
      {
        "type": "input_value",
        "name": "PITCH",
        "check": "Number",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": 'Music_playNoteTooltip',
  },
  {
    "type": "music_rest_whole",
    "message0": 'Music_rest %1',
    "args0": [
      {
        "type": "field_image",
        "src": mediaPrefix + "music/rest1.png",
        "width": 10,
        "height": 20,
        "alt": "-",
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": 'Music_restWholeTooltip',
  },
  {
    "type": "music_rest",
    "message0": 'Music_rest %1',
    "args0": [
      {
        "type": "field_dropdown",
        "name": "DURATION",
        "options": [
          [{
            "src": mediaPrefix + "music/rest1.png",
            "width": 10, "height": 20, "alt": "whole",
          }, "1"],
          [{
            "src": mediaPrefix + "music/rest0.5.png",
            "width": 10, "height": 20, "alt": "half",
          }, "0.5"],
          [{
            "src": mediaPrefix + "music/rest0.25.png",
            "width": 10, "height": 20, "alt": "quarter",
          }, "0.25"],
          [{
            "src": mediaPrefix + "music/rest0.125.png",
            "width": 10, "height": 20, "alt": "eighth",
          }, "0.125"],
          [{
            "src": mediaPrefix + "music/rest0.0625.png",
            "width": 10, "height": 20, "alt": "sixteenth",
          }, "0.0625"],
        ],
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": 'Music_restTooltip',
  },
  {
    "type": "music_instrument",
    "message0": 'Music_setInstrument %1',
    "args0": [
      {
        "type": "field_dropdown",
        "name": "INSTRUMENT",
        "options": [
          [('Music_piano'), "piano"],
          [('Music_trumpet'), "trumpet"],
          [('Music_banjo'), "banjo"],
          [('Music_violin'), "violin"],
          [('Music_guitar'), "guitar"],
          [('Music_flute'), "flute"],
          [('Music_drum'), "drum"],
          [('Music_choir'), "choir"],
        ],
      },
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": 'Music_setInstrumentTooltip',
  },
  {
    "type": "music_start",
    "message0": 'Music_start %1',
    "args0": [
      {
        "type": "field_image",
        "src": mediaPrefix + "music/play.png",
        "width": 17,
        "height": 17,
        "alt": "▶",
      },
    ],
    "message1": "%1",
    "args1": [
      {
        "type": "input_statement",
        "name": "STACK",
      },
    ],
    "colour": 0,
    "tooltip": 'Music_startTooltip',
  },
]);

export const toolboxPitch = {
  "kind": "flyoutToolbox",
  "contents": [
    {
      "kind": "block",
      "type": "pitch_test",
    },

    {
      "kind": "block",
      "type": "music_pitch",
    },
    {
      "kind": "block",
      "type": "music_note",
    },
    {
      "kind": "block",
      "type": "music_rest_whole",
    },
    {
      "kind": "block",
      "type": "music_rest",
    },
    {
      "kind": "block",
      "type": "music_instrument",
    },
    {
      "kind": "block",
      "type": "music_start",
    },
  ],
};

/* eslint-enable quotes */
