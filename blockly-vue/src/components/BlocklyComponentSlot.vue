<template>
  <div>
    <div id="blocklyDiv">
    </div>
    <xml id="toolbox" style="display:none">
      <slot></slot>
    </xml>
  </div>
</template>

<script>
/**
 * @license
 * 
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import Blockly from 'blockly';

export default {
  name: 'BlocklyComponentSlot',
  data(){
    return {
      workspace: null
    }
  },
  mounted() {
    this.workspace = Blockly.inject(document.getElementById('blocklyDiv'), {
      toolbox: document.getElementById('toolbox')
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#blocklyDiv {
  height: 400px;
  width: 400px;
  position: absolute;
  text-align: left;
}
</style>
