export default {
  'blocks': {
    'languageVersion': 0,
    'blocks': [
      {
        'type': 'controls_ifelse',
      },
      {
        'type': 'logic_compare',
        'fields': {
          'OP': 'EQ',
        },
      },
      {
        'type': 'logic_operation',
        'fields': {
          'OP': 'AND',
        },
      },
      {
        'type': 'controls_repeat_ext',
        'inputs': {
          'TIMES': {
            'shadow': {
              'type': 'math_number',
              'fields': {
                'NUM': 10,
              },
            },
          },
        },
      },
      {
        'type': 'logic_operation',
        'fields': {
          'OP': 'AND',
        },
      },
      {
        'type': 'logic_negate',
      },
      {
        'type': 'logic_boolean',
        'fields': {
          'BOOL': 'TRUE',
        },
      },
      {
        'type': 'logic_null',
        'enabled': false,
      },
      {
        'type': 'logic_ternary',
      },
      {
        'type': 'text_charAt',
        'extraState': '<mutation at="true"></mutation>',
        'fields': {
          'WHERE': 'FROM_START',
        },
        'inputs': {
          'VALUE': {
            'block': {
              'type': 'variables_get',
              'fields': {
                'VAR': {
                  'id': '{3!sh(%.@[UaGqJV==ke',
                },
              },
            },
          },
        },
      },
    ],
  },
  'variables': [
    {
      'name': 'text',
      'id': '{3!sh(%.@[UaGqJV==ke',
    },
  ],
};


/* `<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple" style="display: none">
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
 */
