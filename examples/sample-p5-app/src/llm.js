/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { blocksToString } from "./blocks_to_string";

const url = `https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=${AI_TOKEN}`

export async function testLLMCall() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "prompt": { "text": "Tell me an animal fact"}
    }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
}
// testLLMCall();

export async function getSummary(block) {
  const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "prompt": { "text": createPrompt(block)}
    }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
  return data?.candidates?.[0]?.output;
}

function createPrompt(block) {
  const blockString = blocksToString(block);
  return `"Program #1:

\`\`\`
draw set fill colour to #090 draw rectangle x 190 y 190 width 20 height 200 set fill colour to #963draw ellipse x 200 y 200 width 100 height 100 set fill colour to #fc0 set radius to (200 ÷ 3) set angleStep to (360 ÷ 20) count with angle from 0 to 360 by angleStep do set x to (((cos angle) × radius) + 200) set y to (((sin angle) × radius) + 200) draw ellipse x x y y width (radius ÷ 2) height (radius ÷ 2)
\`\`\`

Summary #1: Draws a sunflower.

Program #2:

\`\`\`
draw
   set stroke colour to #000
   set fill colour to #000
   draw ellipse x 200 y 200 width 30 height 80
   set stroke colour to #000
   draw line x1 200 y1 160 x2 180 y2 140
   draw line x1 200 y1 160 x2 220 y2 140
   set stroke colour to #c3c
   set fill colour to #c3c
   draw ellipse x 160 y 180 width 50 height 50
   draw ellipse x 165 y 220 width 40 height 30
   draw ellipse x 240 y 180 width 50 height 50
   draw ellipse x 235 y 220 width 40 height 30
\`\`\`

Summary #2: Draws a butterfly.


Program #3:
\`\`\`
${blockString}
\`\`\`

Summary #3:
`
}
