import * as JavaScript from 'blockly/javascript';
import * as Dart from 'blockly/dart';
import * as Lua from 'blockly/lua';
import * as PHP from 'blockly/php';
import * as Python from 'blockly/python';

// TODO: Write correct types for the `generators` parameter for each block's 
// `install` function.
export type Generators = {
    javascript?: typeof JavaScript.javascriptGenerator;
    dart?: typeof Dart.dartGenerator;
    lua?: typeof Lua.luaGenerator;
    php?: typeof PHP.phpGenerator;
    python?: typeof Python.pythonGenerator;
};
