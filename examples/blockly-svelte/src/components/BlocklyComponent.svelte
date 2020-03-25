<script>
  import { onMount } from 'svelte';
  import Blockly from 'blockly';

  onMount(() => {
    Blockly.inject(document.getElementById("blocklyDiv"), {
      toolbox: document.getElementById("toolbox")
    });
  });
</script>

<style scoped>
  #blocklyDiv {
    height: 100%;
    width: 100%;
    position: absolute;
    bottom: 0;
    text-align: left;
  }
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<div>
  <div id="blocklyDiv" />
  <xml id="toolbox" style="display:none">
    <slot />
  </xml>
</div>
