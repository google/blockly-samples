<script>
  import BlocklyComponent from "./components/BlocklyComponent.svelte";
</script>

<style>
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>

<div id="app">
  <BlocklyComponent>
    <block type="controls_ifelse" />
    <block type="logic_compare" />
    <block type="logic_operation" />
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="logic_operation" />
    <block type="logic_negate" />
    <block type="logic_boolean" />
    <block type="logic_null" disabled="true" />
    <block type="logic_ternary" />
    <block type="text_charAt">
      <value name="VALUE">
        <block type="variables_get">
          <field name="VAR">text</field>
        </block>
      </value>
    </block>
  </BlocklyComponent>
</div>
