/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox for Blockly's DevSite demo.
 */
'use strict';

// eslint-disable-next-line no-unused-vars, prefer-const
let toolboxJson = {
  contents: [
    {
      // Logic Category
      kind: 'CATEGORY',
      colour: 262,
      contents: [
        {
          kind: 'BLOCK',
          type: 'controls_if',
        },
        {
          kind: 'BLOCK',
          type: 'logic_compare',
        },
        {
          kind: 'BLOCK',
          type: 'logic_operation',
        },
        {
          kind: 'BLOCK',
          type: 'logic_negate',
        },
        {
          kind: 'BLOCK',
          type: 'logic_boolean',
        },
        {
          kind: 'BLOCK',
          type: 'logic_ternary',
        },
      ],
    },

    {
      // Loops Category
      kind: 'CATEGORY',
      colour: 122,
      contents: [
        {
          kind: 'BLOCK',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 10},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'controls_whileUntil',
        },
        {
          kind: 'BLOCK',
          type: 'controls_for',
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 10},
              },
            },
            BY: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'controls_forEach',
        },
        {
          kind: 'BLOCK',
          type: 'controls_flow_statements',
        },
      ],
    },

    {
      // Math Category
      kind: 'CATEGORY',
      colour: 206,
      contents: [
        {
          kind: 'BLOCK',
          type: 'math_number',
          fields: {NUM: 123},
        },
        {
          kind: 'BLOCK',
          type: 'math_arithmetic',
          inputs: {
            A: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
            B: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_single',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 9},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_trig',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 45},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_atan2',
          inputs: {
            X: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
            Y: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_constant',
        },
        {
          kind: 'BLOCK',
          type: 'math_number_property',
          inputs: {
            NUMBER_TO_CHECK: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 0},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_round',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 3.1},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_on_list',
        },
        {
          kind: 'BLOCK',
          type: 'math_modulo',
          inputs: {
            DIVIDEND: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 64},
              },
            },
            DIVISOR: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 10},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_constrain',
          inputs: {
            VALUE: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 50},
              },
            },
            LOW: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
            HIGH: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 100},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_random_int',
          inputs: {
            FROM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 1},
              },
            },
            TO: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 100},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'math_random_float',
        },
      ],
    },

    {
      // Text Category
      kind: 'CATEGORY',
      colour: 46,
      contents: [
        {
          kind: 'BLOCK',
          type: 'text',
        },
        {
          kind: 'BLOCK',
          type: 'text_join',
          extraState: {itemCount: 2},
        },
        {
          kind: 'BLOCK',
          type: 'text_append',
          fields: {
            VAR: {
              name: 'text',
              type: 'String',
            },
          },
          inputs: {
            TEXT: {
              shadow: {type: 'text'},
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_length',
          inputs: {
            VALUE: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_isEmpty',
          inputs: {
            VALUE: {
              shadow: {type: 'text'},
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_indexOf',
          inputs: {
            VALUE: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
            FIND: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'b'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_charAt',
          inputs: {
            VALUE: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_getSubstring',
          inputs: {
            STRING: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_changeCase',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'abc',
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_trim',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {TEXT: ' abc '},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_count',
          inputs: {
            SUB: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'a'},
              },
            },
            TEXT: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'banana'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_replace',
          inputs: {
            FROM: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'm'},
              },
            },
            TO: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'w'},
              },
            },
            TEXT: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'mom'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_reverse',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {
                  TEXT: 'cba',
                },
              },
            },
          },
        },
        {
          kind: 'label',
          text: '',
        },

        {
          kind: 'BLOCK',
          type: 'text_print',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'text_prompt_ext',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: {TEXT: 'abc'},
              },
            },
          },
        },
      ],
    },

    {
      // Lists Category
      kind: 'CATEGORY',
      colour: 172,
      contents: [
        {
          kind: 'BLOCK',
          type: 'lists_create_with',
          extraState: {itemCount: 0},
        },
        {
          kind: 'BLOCK',
          type: 'lists_create_with',
          extraState: {itemCount: 3},
        },
        {
          kind: 'BLOCK',
          type: 'lists_repeat',
          inputs: {
            NUM: {
              shadow: {
                type: 'math_number',
                fields: {NUM: 5},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_length',
        },
        {
          kind: 'BLOCK',
          type: 'lists_isEmpty',
        },
        {
          kind: 'BLOCK',
          type: 'lists_indexOf',
          inputs: {
            VALUE: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_getIndex',
          inputs: {
            VALUE: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_setIndex',
          inputs: {
            LIST: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_getSublist',
          inputs: {
            LIST: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_getSublist',
          inputs: {
            LIST: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_split',
          inputs: {
            DELIM: {
              shadow: {
                type: 'text',
                fields: {TEXT: ','},
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_sort',
          inputs: {
            LIST: {
              block: {
                type: 'variables_get',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
        {
          kind: 'BLOCK',
          type: 'lists_reverse',
          inputs: {
            LIST: {
              block: {
                type: 'variables_get',
                id: 'Jyppgi#k[zERF`IH{gqY',
                fields: {
                  VAR: {
                    name: '%{BKY_VARIABLES_DEFAULT_NAME}',
                    type: 'List',
                  },
                },
              },
            },
          },
        },
      ],
    },

    {
      kind: 'SEP',
    },

    {
      // Variable Category
      kind: 'CATEGORY',
      custom: 'VARIABLE',
      colour: 4,
    },

    {
      // Function Category
      kind: 'CATEGORY',
      custom: 'PROCEDURE',
      colour: 16,
    },
  ],
};
