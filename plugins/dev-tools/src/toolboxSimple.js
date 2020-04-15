export default `<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple" style="display: none">
<block type="controls_ifelse"></block>
<block type="logic_compare"></block>
<!-- <block type="control_repeat"></block> -->
<block type="logic_operation"></block>
<block type="controls_repeat_ext">
  <value name="TIMES">
    <shadow type="math_number">
      <field name="NUM">10</field>
    </shadow>
  </value>
</block>
<block type="logic_operation"></block>
<block type="logic_negate"></block>
<block type="logic_boolean"></block>
<block type="logic_null" disabled="true"></block>
<block type="logic_ternary"></block>
<block type="text_charAt">
  <value name="VALUE">
    <block type="variables_get">
      <field name="VAR">text</field>
    </block>
  </value>
</block>
</xml>`;
