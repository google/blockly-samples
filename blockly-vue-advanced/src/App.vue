<template>
  <div id="app">
    <p>
      <button v-on:click="showCode()">Show JavaScript</button>
    </p>
    <pre v-html="code"></pre>
    <BlocklyComponent id="component1" ref="foo"></BlocklyComponent>
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
 * @fileoverview Main Vue component that includes the Blockly component.
 * @author abbychau@gmail.com (Abby Chau)
 */

import BlocklyComponent from "./components/BlocklyComponent.vue";

export default {
  name: "app",
  data: function() {
    return { code: "" };
  },

  components: {
    BlocklyComponent
  },
  methods: {
    showCode() {
      this.code = this.$refs["foo"].toCode();
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

html,
body {
  margin: 0;
}
#component1 {
  height: 50%;
  width: 100%;
  position: absolute;
  bottom: 0;
  text-align: left;
}
</style>
