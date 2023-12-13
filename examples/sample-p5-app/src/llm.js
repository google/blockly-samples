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
  return `Create a one sentence summary of the following code ${blockString}`;
}
