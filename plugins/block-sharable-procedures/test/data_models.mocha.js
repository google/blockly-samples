/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const Blockly = require('blockly/node');
const {ObservableProcedureModel} = require('../src/observable_procedure_model');
const {ObservableParameterModel} = require('../src/observable_parameter_model');


suite('Procedure data models', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.procedureMap = this.workspace.getProcedureMap();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  suite('triggering block updates', function() {
    setup(function() {
      Blockly.Blocks['procedure_mock'] = {
        init: function() { },
        doProcedureUpdate: function() { },
        getProcedureModel: function() { },
        isProcedureDef: function() { },
      };

      this.procedureBlock = this.workspace.newBlock('procedure_mock');

      this.updateSpy = sinon.spy(this.procedureBlock, 'doProcedureUpdate');
    });

    teardown(function() {
      delete Blockly.Blocks['procedure_mock'];
    });

    suite('procedure map updates', function() {
      test('inserting a procedure does not trigger an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name');
        this.procedureMap.set(procedureModel.getId(), procedureModel);

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('adding a procedure does not trigger an update', function() {
        this.procedureMap.add(
            new ObservableProcedureModel(this.workspace, 'test name'));

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('deleting a procedure triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        this.procedureMap.delete(procedureModel.getId());

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('procedure model updates', function() {
      test('setting the name triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setName('new name');

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('setting the return type triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setReturnTypes([]);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('removing the return type triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name')
                .setReturnTypes([]);
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.setReturnTypes(null);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('disabling the procedure triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setEnabled(false);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('enabling the procedure triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name')
                .setEnabled(false);
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.setEnabled(true);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('inserting a parameter triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.insertParameter(
            new ObservableParameterModel(this.workspace, ''), 0);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('deleting a parameter triggers an update', function() {
        const procedureModel =
            new ObservableProcedureModel(this.workspace, 'test name')
                .insertParameter(
                    new ObservableParameterModel(this.workspace, ''), 0);
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.deleteParameter(0);

        assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('parameter model updates', function() {
      test('setting the name triggers an update', function() {
        const parameterModel =
            new ObservableParameterModel(this.workspace, 'test1');
        this.procedureMap.add(
            new ObservableProcedureModel(this.workspace, 'test name')
                .insertParameter(parameterModel, 0));
        this.updateSpy.resetHistory();

        parameterModel.setName('test2');

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test(
          'modifying the variable model does not trigger an update',
          function() {
            const parameterModel =
                new ObservableParameterModel(this.workspace, 'test1');
            this.procedureMap.add(
                new ObservableProcedureModel(this.workspace, 'test name')
                    .insertParameter(parameterModel, 0));
            this.updateSpy.resetHistory();

            const variableModel = parameterModel.getVariableModel();
            variableModel.name = 'some name';
            variableModel.type = 'some type';

            chai.assert.isFalse(
                this.updateSpy.called, 'Expected no update to be triggered');
          });
    });
  });

  suite('backing variable to parameters', function() {
    test(
        'construction references an existing variable if available',
        function() {
          const variable = this.workspace.createVariable('test1');
          const param = new ObservableParameterModel(this.workspace, 'test1');

          chai.assert.equal(
              variable,
              param.getVariableModel(),
              'Expected the parameter model to reference the existing variable'
          );
        });

    test('construction creates a variable if none exists', function() {
      const param = new ObservableParameterModel(this.workspace, 'test1');

      chai.assert.equal(
          this.workspace.getVariable('test1'),
          param.getVariableModel(),
          'Expected the parameter model to create a variable');
    });

    test('setName references an existing variable if available', function() {
      const variable = this.workspace.createVariable('test2');
      const param = new ObservableParameterModel(this.workspace, 'test1');

      param.setName('test2');

      chai.assert.equal(
          variable,
          param.getVariableModel(),
          'Expected the parameter model to reference the existing variable');
    });

    test('setName creates a variable if none exits', function() {
      const param = new ObservableParameterModel(this.workspace, 'test1');

      param.setName('test2');

      chai.assert.equal(
          this.workspace.getVariable('test2'),
          param.getVariableModel(),
          'Expected the parameter model to create a variable');
    });

    test('setTypes is unimplemented', function() {
      const param = new ObservableParameterModel(this.workspace, 'test1');

      chai.assert.throws(
          () => {
            param.setTypes(['some', 'types']);
          },
          'The built-in ParameterModel does not support typing');
    });
  });
});
