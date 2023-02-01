
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const Blockly = require('blockly/node');
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const {
  assertCallBlockStructure,
  assertDefBlockStructure,
  createGenUidStubWithReturns,
  createProcCallBlock,
  createProcDefBlock,
} = require('./procedure_test_helpers');
const {ObservableParameterModel} = require('../src/observable_parameter_model');
const {blocks} = require('../src/blocks');
const {unregisterProcedureBlocks} = require('../src/index');


suite('Procedures', function() {
  setup(function() {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');

    this.sandbox = sinon.createSandbox();
    this.clock = this.sandbox.useFakeTimers();

    unregisterProcedureBlocks();
    Blockly.common.defineBlocks(blocks);

    // this.workspace = new Blockly.Workspace();
    this.workspace = Blockly.inject('blocklyDiv', {});

    this.workspace.createVariable('preCreatedVar', '', 'preCreatedVarId');
    this.workspace.createVariable(
        'preCreatedTypedVar', 'type', 'preCreatedTypedVarId');

    Blockly.defineBlocksWithJsonArray([{
      'type': 'row_block',
      'message0': '%1',
      'args0': [
        {
          'type': 'input_value',
          'name': 'INPUT',
        },
      ],
      'output': null,
    }]);

    this.getContextStub = sinon.stub(
        window.HTMLCanvasElement.prototype, 'getContext')
        .callsFake(() => {
          return {
            measureText: function() {
              return {'width': 0};
            },
          };
        });
    this.findParentWsStub = sinon.stub(Blockly.Mutator, 'findParentWs')
        .callsFake(() => {
          return this.workspace;
        });
  });

  teardown(function() {
    this.clock.runAll();
    delete Blockly.Blocks['row_block'];
    this.getContextStub.restore();
    this.findParentWsStub.restore();
    this.sandbox.restore();
    this.jsdomCleanup();
  });

  suite('updating data models', function() {
    test(
        'renaming a procedure def block updates the procedure model',
        function() {
          const defBlock = createProcDefBlock(this.workspace);

          defBlock.setFieldValue('new name', 'NAME');

          assert.equal(
              defBlock.getProcedureModel().getName(),
              'new name',
              'Expected the procedure model name to be updated');
        });

    test(
        'disabling a procedure def block updates the procedure model',
        function() {
          const defBlock = createProcDefBlock(this.workspace);

          defBlock.setEnabled(false);
          this.clock.runAll();

          assert.isFalse(
              defBlock.getProcedureModel().getEnabled(),
              'Expected the procedure model to be disabled');
        });

    test(
        'adding a parameter to a procedure def updates the procedure model',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param name', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);

          defBlock.compose(containerBlock);

          assert.equal(
              defBlock.getProcedureModel().getParameter(0).getName(),
              'param name',
              'Expected the procedure model to have a matching parameter');
        });

    test('adding a parameter adds a variable to the variable map', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const containerBlock = this.workspace
          .newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param name', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);

      defBlock.compose(containerBlock);

      assert.isTrue(
          this.workspace.getVariableMap().getVariablesOfType('')
              .some((variable) => variable.name === 'param name'),
          'Expected the variable map to have a matching variable');
    });


    test(
        'moving a parameter in the procedure def updates the procedure model',
        function() {
          // Create a stack of container, param1, param2.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock1 =
              this.workspace.newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param name1', 'NAME');
          const paramBlock2 =
              this.workspace.newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param name2', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);
          const id1 = defBlock.getProcedureModel().getParameter(0).getId();
          const id2 = defBlock.getProcedureModel().getParameter(1).getId();

          // Reconfigure the stack to be container, param2, param1.
          paramBlock2.previousConnection.disconnect();
          paramBlock1.previousConnection.disconnect();
          containerBlock.getInput('STACK').connection
              .connect(paramBlock2.previousConnection);
          paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
          defBlock.compose(containerBlock);

          assert.equal(
              defBlock.getProcedureModel().getParameter(0).getName(),
              'param name2',
              'Expected the first parameter of the procedure to be param 2');
          assert.equal(
              defBlock.getProcedureModel().getParameter(0).getId(),
              id2,
              'Expected the first parameter of the procedure to be param 2');
          assert.equal(
              defBlock.getProcedureModel().getParameter(1).getName(),
              'param name1',
              'Expected the second parameter of the procedure to be param 1');
          assert.equal(
              defBlock.getProcedureModel().getParameter(1).getId(),
              id1,
              'Expected the second parameter of the procedure to be param 1');
        });

    test('decomposing and recomposing maintains parameter IDs', function() {
      // Create a stack of container, param.
      const defBlock = createProcDefBlock(this.workspace);
      const containerBlock = this.workspace
          .newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param name', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);
      const paramBlockId = defBlock.getProcedureModel().getParameter(0).getId();

      Blockly.Events.disable();
      this.workspace.clear();
      Blockly.Events.enable();
      const container = defBlock.decompose(this.workspace);
      defBlock.compose(container);

      assert.equal(
          defBlock.getProcedureModel().getParameter(0).getId(),
          paramBlockId,
          'Expected the parameter ID to be maintained');
    });

    test(
        'deleting a parameter from a procedure def updates the procedure model',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param name', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          containerBlock.getInput('STACK').connection.disconnect();
          defBlock.compose(containerBlock);

          assert.isEmpty(
              defBlock.getProcedureModel().getParameters(),
              'Expected the procedure model to have no parameters');
        });

    test(
        'renaming a procedure parameter updates the parameter model',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param name', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          paramBlock.setFieldValue('new param name', 'NAME');
          defBlock.compose(containerBlock);

          assert.equal(
              defBlock.getProcedureModel().getParameter(0).getName(),
              'new param name',
              'Expected the procedure model to have a matching parameter');
        });

    test('deleting a procedure deletes the procedure model', function() {
      const defBlock = createProcDefBlock(this.workspace);
      const model = defBlock.getProcedureModel();
      defBlock.dispose();

      assert.isUndefined(
          this.workspace.getProcedureMap().get(model.getId()),
          'Expected the model to be removed from the procedure map');
    });
  });

  suite('responding to data model updates', function() {
    suite('def blocks', function() {
      test('renaming the procedure data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setName('new name');

        assert.equal(
            defBlock.getFieldValue('NAME'),
            'new name',
            'Expected the procedure block to be renamed');
      });

      test('disabling a procedure data model disables blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setEnabled(false);

        assert.isFalse(
            defBlock.isEnabled(),
            'Expected the procedure block to be disabled');
      });

      test('adding a parameter to a data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.insertParameter(
            new ObservableParameterModel(this.workspace, 'param1', 'id'), 0);

        assert.isNotNull(
            defBlock.getField('PARAMS'),
            'Expected the params field to exist');
        assert.isTrue(
            defBlock.getFieldValue('PARAMS').includes('param1'),
            'Expected the params field to contain the name of the new param');
      });

      test('moving a parameter in the data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();
        const param1 =
            new ObservableParameterModel(this.workspace, 'param1', 'id1');
        const param2 =
            new ObservableParameterModel(this.workspace, 'param2', 'id2');
        procModel.insertParameter(param1, 0);
        procModel.insertParameter(param2, 1);

        procModel.deleteParameter(1);
        procModel.insertParameter(param2, 0);

        assert.isNotNull(
            defBlock.getField('PARAMS'),
            'Expected the params field to exist');
        assert.isTrue(
            defBlock.getFieldValue('PARAMS').includes('param2, param1'),
            'Expected the params field order to match the parameter order');
      });

      test(
          'deleting a parameter from the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            const param2 =
                new ObservableParameterModel(this.workspace, 'param2', 'id2');
            procModel.insertParameter(param1, 0);
            procModel.insertParameter(param2, 1);

            procModel.deleteParameter(0);

            assert.isNotNull(
                defBlock.getField('PARAMS'),
                'Expected the params field to exist');
            assert.isTrue(
                defBlock.getFieldValue('PARAMS').includes('param2'),
                'Expected the params field order to contain one parameter');
            assert.isFalse(
                defBlock.getFieldValue('PARAMS').includes('param1'),
                'Expected the params field to not contain the ' +
                'deleted parameter');
          });

      test(
          'renaming a procedure parameter in the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            procModel.insertParameter(param1, 0);

            param1.setName('new name');

            assert.isNotNull(
                defBlock.getField('PARAMS'),
                'Expected the params field to exist');
            assert.isTrue(
                defBlock.getFieldValue('PARAMS').includes('new name'),
                'Expected the params field to contain the new param name');
          });
    });

    suite('caller blocks', function() {
      test('renaming the procedure data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setName('new name');

        assert.equal(
            callBlock.getFieldValue('NAME'),
            'new name',
            'Expected the procedure block to be renamed');
      });

      test('disabling a procedure data model disables blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setEnabled(false);

        assert.isFalse(
            callBlock.isEnabled(),
            'Expected the procedure block to be disabled');
      });

      test('adding a parameter to a data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.insertParameter(
            new ObservableParameterModel(this.workspace, 'param1', 'id'), 0);

        assert.isNotNull(
            callBlock.getInput('ARG0'),
            'Expected the param input to exist');
        assert.equal(
            callBlock.getFieldValue('ARGNAME0'),
            'param1',
            'Expected the params field to match the name of the new param');
      });

      test('moving a parameter in the data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();
        const param1 =
            new ObservableParameterModel(this.workspace, 'param1', 'id1');
        const param2 =
            new ObservableParameterModel(this.workspace, 'param2', 'id2');
        procModel.insertParameter(param1, 0);
        procModel.insertParameter(param2, 1);

        procModel.deleteParameter(1);
        procModel.insertParameter(param2, 0);

        assert.isNotNull(
            callBlock.getInput('ARG0'),
            'Expected the first param input to exist');
        assert.isNotNull(
            callBlock.getInput('ARG1'),
            'Expected the second param input to exist');
        assert.equal(
            callBlock.getFieldValue('ARGNAME0'),
            'param2',
            'Expected the first params field to match the name of the param');
        assert.equal(
            callBlock.getFieldValue('ARGNAME1'),
            'param1',
            'Expected the second params field to match the name of the param');
      });

      test(
          'moving a parameter in the data model moves input blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const callBlock = createProcCallBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            const param2 =
                new ObservableParameterModel(this.workspace, 'param2', 'id2');
            procModel.insertParameter(param1, 0);
            procModel.insertParameter(param2, 1);
            const rowBlock1 = this.workspace.newBlock('row_block');
            const rowBlock2 = this.workspace.newBlock('row_block');
            callBlock.getInput('ARG0').connection
                .connect(rowBlock1.outputConnection);
            callBlock.getInput('ARG1').connection
                .connect(rowBlock2.outputConnection);

            procModel.deleteParameter(1);
            procModel.insertParameter(param2, 0);

            assert.isNotNull(
                callBlock.getInput('ARG0'),
                'Expected the first param input to exist');
            assert.equal(
                callBlock.getInputTargetBlock('ARG0'),
                rowBlock2,
                'Expected the second row block to be attached to the ' +
                'first input');
            assert.isNotNull(
                callBlock.getInput('ARG1'),
                'Expected the second param input to exist');
            assert.equal(
                callBlock.getInputTargetBlock('ARG1'),
                rowBlock1,
                'Expected the first row block to be attached to the ' +
                'second input');
          });

      test(
          'deleting a parameter from the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const callBlock = createProcCallBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            const param2 =
                new ObservableParameterModel(this.workspace, 'param2', 'id2');
            procModel.insertParameter(param1, 0);
            procModel.insertParameter(param2, 1);

            procModel.deleteParameter(0);

            assert.isNotNull(
                callBlock.getInput('ARG0'),
                'Expected the first param input to exist');
            assert.isNull(
                callBlock.getInput('ARG1'),
                'Expected the second param input to not exist');
            assert.equal(
                callBlock.getFieldValue('ARGNAME0'),
                'param2',
                'Expected the first params field to match the name of ' +
                'the param');
          });

      test(
          'renaming a procedure parameter in the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const callBlock = createProcCallBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            procModel.insertParameter(param1, 0);

            param1.setName('new name');

            assert.isNotNull(
                callBlock.getInput('ARG0'),
                'Expected the param input to exist');
            assert.equal(
                callBlock.getFieldValue('ARGNAME0'),
                'new name',
                'Expected the params field to match the new name of the param');
          });
    });
  });

  suite('deserializing data models', function() {
    suite('return types', function() {
      test('procedure defs without returns have null return types', function() {
        const json = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'procedures_defnoreturn',
                'fields': {
                  'NAME': 'test name',
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(json, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.isNull(
            procedureModel.getReturnTypes(),
            'Expected the return types to be null');
      });

      test('procedure defs with returns have array return types', function() {
        const json = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'procedures_defreturn',
                'fields': {
                  'NAME': 'test name',
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(json, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.isArray(
            procedureModel.getReturnTypes(),
            'Expected the return types to be an array');
      });
    });

    suite('json', function() {
      test('procedure names get deserialized', function() {
        const json = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'procedures_defnoreturn',
                'fields': {
                  'NAME': 'test name',
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(json, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.name,
            'test name',
            'Expected the name of the procedure model to equal the name ' +
            'being deserialized.');
      });

      test('procedure parameter names get deserialized', function() {
        const json = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'procedures_defnoreturn',
                'fields': {
                  'NAME': 'test name',
                },
                'extraState': {
                  'params': [
                    {
                      'id': 'test id 1',
                      'name': 'test name 1',
                    },
                    {
                      'id': 'test id 2',
                      'name': 'test name 2',
                    },
                  ],
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(json, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.getParameter(0).getName(),
            'test name 1',
            'Expected the name of the first parameter to equal the name ' +
            'being deserialized.');
        assert.equal(
            procedureModel.getParameter(1).getName(),
            'test name 2',
            'Expected the name of the second parameter to equal the name ' +
            'being deserialized.');
      });

      test('procedure variables get matching IDs', function() {
        const json = {
          'blocks': {
            'languageVersion': 0,
            'blocks': [
              {
                'type': 'procedures_defnoreturn',
                'extraState': {
                  'params': [
                    {
                      'name': 'test param name',
                      'id': 'test param id',
                    },
                  ],
                },
                'fields': {
                  'NAME': 'test proc name',
                },
              },
            ],
          },
          'variables': [
            {
              'name': 'test param name',
              'id': 'test param id',
            },
          ],
        };
        Blockly.serialization.workspaces.load(json, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.getParameter(0).getVariableModel().getId(),
            'test param id',
            'Expected the variable id to match the serialized param id');
      });
    });

    suite('xml', function() {
      test('procedure names get deserialized', function() {
        const xml = Blockly.Xml.textToDom(
            `<block type="procedures_defnoreturn">` +
            `  <field name="NAME">test name</field>` +
            `</block>`);
        Blockly.Xml.domToBlock(xml, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.name,
            'test name',
            'Expected the name of the procedure model to equal the name ' +
            'being deserialized.');
      });

      test('procedure parameter names get deserialized', function() {
        const xml = Blockly.Xml.textToDom(
            `<block type="procedures_defnoreturn">` +
            `  <mutation>` +
            `    <arg name="test name 1" varid="test var id 1"/>` +
            `    <arg name="test name 2" varid="test var id 2"/>` +
            `  </mutation>` +
            `  <field name="NAME">test name</field>` +
            `</block>`);
        Blockly.Xml.domToBlock(xml, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.getParameter(0).getName(),
            'test name 1',
            'Expected the name of the first parameter to equal the name ' +
            'being deserialized.');
        assert.equal(
            procedureModel.getParameter(1).getName(),
            'test name 2',
            'Expected the name of the second parameter to equal the name ' +
            'being deserialized.');
      });

      test('procedure variables get matching IDs', function() {
        const xml = Blockly.Xml.textToDom(
            `<xml>` +
            `  <variables>` +
            `    <variable id ="test param id">test param name</variable>` +
            `  </variables>` +
            `  <block type="procedures_defnoreturn">` +
            `    <mutation>` +
            `      <arg name="test param name" varid="test param id"/>` +
            `    </mutation>` +
            `    <field name="NAME">test name</field>` +
            `  </block>` +
            `</xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        const procedureModel =
            this.workspace.getProcedureMap().getProcedures()[0];

        assert.equal(
            procedureModel.getParameter(0).getVariableModel().getId(),
            'test param id',
            'Expected the variable id to match the serialized param id');
      });
    });
  });

  suite('renaming procedures', function() {
    test('callers are updated to have the new name', function() {
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);

      defBlock.setFieldValue('new name', 'NAME');

      assert.equal(
          callBlock.getFieldValue('NAME'),
          'new name',
          'Expected the procedure block to be renamed');
    });

    test(
        'setting an illegal name results in both the ' +
        'procedure and the caller getting the legal name',
        function() {
          createProcDefBlock(this.workspace, undefined, undefined, 'procA');
          const defBlockB =
              createProcDefBlock(this.workspace, undefined, undefined, 'procB');
          const callBlockB =
              createProcCallBlock(this.workspace, undefined, 'procB');

          defBlockB.setFieldValue('procA', 'NAME');

          assert.notEqual(
              defBlockB.getFieldValue('NAME'),
              'procA',
              'Expected the procedure def block to have a legal name');
          assert.notEqual(
              callBlockB.getFieldValue('NAME'),
              'procA',
              'Expected the procedure call block to have a legal name');
        });
  });

  suite('adding procedure parameters', function() {
    test(
        'adding a parameter to the procedure updates procedure defs',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('param1'),
              'Expected the params field to contain the name of the new param');
        });

    test(
        'adding a parameter to the procedure updates procedure callers',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          assert.isNotNull(
              callBlock.getInput('ARG0'),
              'Expected the param input to exist');
          assert.equal(
              callBlock.getFieldValue('ARGNAME0'),
              'param1',
              'Expected the params field to match the name of the new param');
        });
  });

  suite('deleting procedure parameters', function() {
    test(
        'deleting a parameter from the procedure updates procedure defs',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          paramBlock.dispose();
          defBlock.compose(containerBlock);

          assert.isFalse(
              defBlock.getFieldValue('PARAMS').includes('param1'),
              'Expected the params field to not contain the name of the ' +
              'new param');
        });

    test(
        'deleting a parameter from the procedure updates procedure callers',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          paramBlock.checkAndDelete();
          defBlock.compose(containerBlock);

          assert.isNull(
              callBlock.getInput('ARG0'),
              'Expected the param input to not exist');
        });
  });

  suite('renaming procedure parameters', function() {
    test('defs are updated for parameter renames', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const containerBlock = this.workspace
          .newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);

      paramBlock.setFieldValue('new name', 'NAME');
      defBlock.compose(containerBlock);

      assert.isNotNull(
          defBlock.getField('PARAMS'),
          'Expected the params field to exist');
      assert.isTrue(
          defBlock.getFieldValue('PARAMS').includes('new name'),
          'Expected the params field to contain the new name of the param');
    });

    test('defs are updated for parameter renames when two params exist',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock1 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param1', 'NAME');
          const paramBlock2 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param2', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);

          paramBlock1.setFieldValue('new name', 'NAME');
          defBlock.compose(containerBlock);

          assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('new name'),
              'Expected the params field to contain the new name of the param');
        });

    test('callers are updated for parameter renames', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);
      const containerBlock = this.workspace
          .newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);

      paramBlock.setFieldValue('new name', 'NAME');
      defBlock.compose(containerBlock);

      assert.isNotNull(
          callBlock.getInput('ARG0'),
          'Expected the param input to exist');
      assert.equal(
          callBlock.getFieldValue('ARGNAME0'),
          'new name',
          'Expected the params field to match the name of the new param');
    });

    test(
        'variables associated with procedure parameters are not renamed',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          paramBlock.setFieldValue('param2', 'NAME');
          defBlock.compose(containerBlock);

          assert.isNotNull(
              this.workspace.getVariable('param1', ''),
              'Expected the old variable to continue to exist');
        });

    test(
        'renaming a variable associated with a parameter updates ' +
        'procedure defs',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'new name');

          assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('new name'),
              'Expected the params field to contain the new name of the param');
        });

    // TODO(blockly/#): We can't open mutators in node (even with JSDOM) due to
    //    failing instanceof checks. So we can't currently test this.
    test.skip(
        'renaming a variable associated with a parameter updates ' +
        'mutator parameters',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'new name');

          assert.equal(
              paramBlock.getFieldValue('NAME'),
              'new name',
              'Expected the params field to contain the new name of the param');
        });

    test(
        'renaming a variable associated with a parameter updates ' +
        'procedure callers',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'new name');

          assert.isNotNull(
              callBlock.getInput('ARG0'),
              'Expected the param input to exist');
          assert.equal(
              callBlock.getFieldValue('ARGNAME0'),
              'new name',
              'Expected the params field to match the name of the new param');
        });

    test(
        'coalescing a variable associated with a parameter updates ' +
        'procedure defs',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'preCreatedVar');

          assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('preCreatedVar'),
              'Expected the params field to contain the new name of the param');
        });

    // TODO(blockly/#): We can't open mutators in node (even with JSDOM) due to
    //    failing instanceof checks. So we can't currently test this.
    test.skip(
        'coalescing a variable associated with a parameter updates ' +
        'mutator parameters',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'preCreatedVar');

          assert.equal(
              paramBlock.getFieldValue('NAME'),
              'preCreatedVar',
              'Expected the params field to contain the new name of the param');
        });

    test(
        'coalescing a variable associated with a parameter updates ' +
        'procedure callers',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'preCreatedVar');

          assert.isNotNull(
              callBlock.getInput('ARG0'),
              'Expected the param input to exist');
          assert.equal(
              callBlock.getFieldValue('ARGNAME0'),
              'preCreatedVar',
              'Expected the params field to match the name of the new param');
        });

    test.skip(
        'renaming a variable such that you get a parameter ' +
        'conflict does... something!',
        function() {

        });
  });

  suite('reordering procedure parameters', function() {
    test(
        'reordering procedure parameters updates procedure blocks',
        function() {
          // Create a stack of container, parameter, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock1 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param1', 'NAME');
          const paramBlock2 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param2', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);

          // Reorder the parameters.
          paramBlock2.previousConnection.disconnect();
          paramBlock1.previousConnection.disconnect();
          containerBlock.getInput('STACK').connection
              .connect(paramBlock2.previousConnection);
          paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
          defBlock.compose(containerBlock);

          assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('param2, param1'),
              'Expected the params field order to match the parameter order');
        });

    test('reordering procedure parameters updates caller blocks', function() {
      // Create a stack of container, parameter, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);
      const containerBlock = this.workspace
          .newBlock('procedures_mutatorcontainer');
      const paramBlock1 = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock1.setFieldValue('param1', 'NAME');
      const paramBlock2 = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock2.setFieldValue('param2', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock1.previousConnection);
      paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
      defBlock.compose(containerBlock);

      // Reorder the parameters.
      paramBlock2.previousConnection.disconnect();
      paramBlock1.previousConnection.disconnect();
      containerBlock.getInput('STACK').connection
          .connect(paramBlock2.previousConnection);
      paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
      defBlock.compose(containerBlock);

      assert.isNotNull(
          callBlock.getInput('ARG0'),
          'Expected the param input to exist');
      assert.equal(
          callBlock.getFieldValue('ARGNAME0'),
          'param2',
          'Expected the params field to match the name of the second param');
      assert.isNotNull(
          callBlock.getInput('ARG1'),
          'Expected the param input to exist');
      assert.equal(
          callBlock.getFieldValue('ARGNAME1'),
          'param1',
          'Expected the params field to match the name of the first param');
    });

    test(
        'reordering procedure parameters reorders the blocks ' +
        'attached to caller inputs',
        function() {
          // Create a stack of container, parameter, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          const containerBlock = this.workspace
              .newBlock('procedures_mutatorcontainer');
          const paramBlock1 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param1', 'NAME');
          const paramBlock2 = this.workspace
              .newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param2', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);

          // Add args to the parameter inputs on the caller.
          const block1 = this.workspace.newBlock('text');
          const block2 = this.workspace.newBlock('text');
          callBlock.getInput('ARG0').connection
              .connect(block1.outputConnection);
          callBlock.getInput('ARG1').connection
              .connect(block2.outputConnection);

          // Reorder the parameters.
          paramBlock2.previousConnection.disconnect();
          paramBlock1.previousConnection.disconnect();
          containerBlock.getInput('STACK').connection
              .connect(paramBlock2.previousConnection);
          paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
          defBlock.compose(containerBlock);

          assert.equal(
              callBlock.getInputTargetBlock('ARG0'),
              block2,
              'Expected the second block to be in the first slot');
          assert.equal(
              callBlock.getInputTargetBlock('ARG1'),
              block1,
              'Expected the first block to be in the second slot');
        });
  });

  suite('enabling and disabling procedure blocks', function() {
    test(
        'if a procedure definition is disabled, the procedure caller ' +
        'is also disabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);

          defBlock.setEnabled(false);
          this.clock.runAll();

          assert.isFalse(
              callBlock.isEnabled(),
              'Expected the caller block to be disabled');
        });

    test(
        'if a procedure definition is enabled, the procedure caller ' +
        'is also enabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          defBlock.setEnabled(false);
          this.clock.runAll();

          defBlock.setEnabled(true);
          this.clock.runAll();

          assert.isTrue(
              callBlock.isEnabled(),
              'Expected the caller block to be enabled');
        });

    test(
        'if a procedure caller block was already disabled before ' +
        'its definition was disabled, it is not reenabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          this.clock.runAll();
          callBlock.setEnabled(false);
          this.clock.runAll();
          defBlock.setEnabled(false);
          this.clock.runAll();

          defBlock.setEnabled(true);
          this.clock.runAll();

          assert.isFalse(
              callBlock.isEnabled(),
              'Expected the caller block to continue to be disabled');
        });
  });

  suite('deleting procedure blocks', function() {
    test(
        'when the procedure definition block is deleted, all of its ' +
        'associated callers are deleted as well',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock1 = createProcCallBlock(this.workspace);
          const callBlock2 = createProcCallBlock(this.workspace);

          defBlock.dispose();
          this.clock.runAll();

          assert.isTrue(
              callBlock1.disposed, 'Expected the first caller to be disposed');
          assert.isTrue(
              callBlock2.disposed, 'Expected the second caller to be disposed');
        });
  });

  suite('caller blocks creating new def blocks', function() {
    setup(function() {
      this.TEST_VAR_ID = 'test-id';
      this.genUidStub = createGenUidStubWithReturns(this.TEST_VAR_ID);
    });

    teardown(function() {
      this.genUidStub.restore();
    });

    suite('xml', function() {
      test('callers without defs create new defs', function() {
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callreturn">
              <mutation name="do something"/>
            </block>`
        ), this.workspace);
        this.clock.runAll();
        assertDefBlockStructure(
            this.workspace.getBlocksByType('procedures_defreturn')[0], true);
        assertCallBlockStructure(callBlock, [], [], 'do something');
      });

      test('callers without mutations create unnamed defs', function() {
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callreturn"></block>'
        ), this.workspace);
        this.clock.runAll();
        assertDefBlockStructure(
            this.workspace.getBlocksByType('procedures_defreturn')[0], true);
        assertCallBlockStructure(callBlock, [], [], 'unnamed');
      });

      test('callers with missing args create new defs', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callreturn">' +
            '  <mutation name="do something"/>' +
            '</block>'
        ), this.workspace);
        this.clock.runAll();
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, [], [], 'do something2');
      });

      test('callers with mismatched args create new defs', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callreturn">
              <mutation name="do something">
                <arg name="y"></arg>
              </mutation>
            </block>
        `), this.workspace);
        this.clock.runAll();
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(
            callBlock, ['y'], [this.TEST_VAR_ID], 'do something2');
      });

      test(
          'callers whose defs are deserialized later do not create defs',
          function() {
            Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(`
                <xml>
                  <block type="procedures_callreturn">
                    <mutation name="do something">
                      <arg name="x"></arg>
                    </mutation>
                  </block>
                  <block type="procedures_defreturn">
                    <field name="NAME">do something</field>
                    <mutation>
                      <arg name="x" varid="arg"></arg>
                    </mutation>
                  </block>
                </xml>
            `), this.workspace);
            this.clock.runAll();
            const defBlock =
                this.workspace.getBlocksByType('procedures_defreturn')[0];
            const callBlock =
                this.workspace.getBlocksByType('procedures_callreturn')[0];
            assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
            assertCallBlockStructure(callBlock, ['x'], ['arg'], 'do something');
            assert.equal(
                defBlock.getProcedureModel(),
                callBlock.getProcedureModel(),
                'Expected the blocks to have the same procedure model');
          });
    });

    suite('json', function() {
      test('callers without defs create new defs', function() {
        const callBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_callreturn',
          'extraState': {
            'name': 'do something',
          },
        }, this.workspace, {recordUndo: true});
        this.clock.runAll();
        assertDefBlockStructure(
            this.workspace.getBlocksByType('procedures_defreturn')[0], true);
        assertCallBlockStructure(callBlock, [], [], 'do something');
      });

      test('callers without extra state create unamed defs', function() {
        // recordUndo must be true to trigger change listener.
        const callBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_callreturn',
        }, this.workspace, {recordUndo: true});
        this.clock.runAll();
        assertDefBlockStructure(
            this.workspace.getBlocksByType('procedures_defreturn')[0], true);
        assertCallBlockStructure(callBlock, [], [], 'unnamed');
      });

      test('callers with missing args create new defs', function() {
        const defBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_defreturn',
          'fields': {
            'NAME': 'do something',
          },
          'extraState': {
            'params': [
              {
                'name': 'x',
                'id': 'arg',
              },
            ],
          },
        }, this.workspace);
        const callBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_callreturn',
          'extraState': {
            'name': 'do something',
          },
        }, this.workspace, {recordUndo: true});
        this.clock.runAll();
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, [], [], 'do something2');
      });

      test('callers with mismatched args create new defs', function() {
        const defBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_defreturn',
          'fields': {
            'NAME': 'do something',
          },
          'extraState': {
            'params': [
              {
                'name': 'x',
                'id': 'arg',
              },
            ],
          },
        }, this.workspace);
        const callBlock = Blockly.serialization.blocks.append({
          'type': 'procedures_callreturn',
          'extraState': {
            'name': 'do something',
            'params': ['y'],
          },
        }, this.workspace, {recordUndo: true});
        this.clock.runAll();
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(
            callBlock, ['y'], [this.TEST_VAR_ID], 'do something2');
      });

      test(
          'callers whose defs are deserialized later do not create defs',
          function() {
            Blockly.serialization.workspaces.load({
              'blocks': {
                'languageVersion': 0,
                'blocks': [
                  {
                    'type': 'procedures_callreturn',
                    'extraState': {
                      'params': ['x'],
                    },
                  },
                  {
                    'type': 'procedures_defreturn',
                    'fields': {
                      'NAME': 'do something',
                    },
                    'extraState': {
                      'params': [
                        {
                          'name': 'x',
                          'id': 'arg',
                        },
                      ],
                    },
                  },
                ],
              },
            }, this.workspace);
            this.clock.runAll();
            const defBlock =
                this.workspace.getBlocksByType('procedures_defreturn')[0];
            const callBlock =
                this.workspace.getBlocksByType('procedures_callreturn')[0];
            assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
            assertCallBlockStructure(callBlock, ['x'], ['arg'], 'do something');
            assert.equal(
                defBlock.getProcedureModel(),
                callBlock.getProcedureModel(),
                'Expected the blocks to have the same procedure model');
          });
    });
  });

  suite('definition block context menu', function() {
    test(
        'the context menu includes an option for creating the caller',
        function() {
          const def = Blockly.serialization.blocks.append({
            'type': 'procedures_defnoreturn',
            'fields': {
              'NAME': 'test name',
            },
          }, this.workspace);

          const options = [];
          def.customContextMenu(options);

          assert.isTrue(
              options[0].text.includes('test name'),
              'Expected the context menu to have an option to create ' +
              'the caller');
        });

    test('the context menu includes an option for each parameter', function() {
      const def = Blockly.serialization.blocks.append({
        'type': 'procedures_defnoreturn',
        'fields': {
          'NAME': 'test name',
        },
        'extraState': {
          'params': [
            {
              'name': 'testParam1',
              'id': 'varId1',
              'paramId': 'paramId1',
            },
            {
              'name': 'testParam2',
              'id': 'varId2',
              'paramId': 'paramId2',
            },
          ],
        },
      }, this.workspace);

      const options = [];
      def.customContextMenu(options);

      assert.isTrue(
          options[1].text.includes('testParam1'),
          'Expected the context menu to have an option to create the ' +
          'first param');
      assert.isTrue(
          options[2].text.includes('testParam2'),
          'Expected the context menu to have an option to create the ' +
          'second param');
    });
  });
});
