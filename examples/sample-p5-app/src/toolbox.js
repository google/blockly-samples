export const toolbox = {
  'kind': 'flyoutToolbox',
  'contents': [
    {
      'kind': 'block',
      'type': 'colour_picker',
    },
    {
      kind: 'block',
      type: 'p5_background_color',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'p5_stroke',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'p5_fill',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'colour_random',
    },
    {
      kind: 'block',
      type: 'p5_ellipse',
      inputs: {
        X: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 100,
            },
          },
        },
        Y: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 100,
            },
          },
        },
        WIDTH: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
        HEIGHT: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
      },
    },
    {
      'kind': 'block',
      'type': 'math_random_int',
      'inputs': {
        'FROM': {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 0,
            },
          },
        },
        'TO': {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 400,
            },
          },
        },
      },
    },
    {
      'kind': 'block',
      'type': 'controls_if',
    },
    {
      'kind': 'block',
      'type': 'controls_repeat_ext',
    },
    {
      'kind': 'block',
      'type': 'logic_compare',
    },
    {
      'kind': 'block',
      'type': 'math_number',
    },
    {
      'kind': 'block',
      'type': 'math_arithmetic',
    },
    {
      'kind': 'block',
      'type': 'text',
    },
    {
      'kind': 'block',
      'type': 'text_print',
    },
  ],
};
