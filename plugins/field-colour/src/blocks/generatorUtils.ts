/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Block } from 'blockly';
import type { JavascriptGenerator} from 'blockly/javascript';
import type { DartGenerator } from 'blockly/dart';
import type { LuaGenerator } from 'blockly/lua';
import type { PhpGenerator } from 'blockly/php';
import type { PythonGenerator } from 'blockly/python';

export type Generators = {
    javascript?: JavascriptGenerator;
    dart?: DartGenerator;
    lua?: LuaGenerator;
    php?: PhpGenerator;
    python?: PythonGenerator;
};

export type JsBlockCodeGenerator = (
    block: Block,
    generator: JavascriptGenerator,
) => [string, number] | string | null;


export type DartBlockCodeGenerator = (
    block: Block,
    generator: DartGenerator,
) => [string, number] | string | null;

export type LuaBlockCodeGenerator = (
    block: Block,
    generator: LuaGenerator,
) => [string, number] | string | null;

export type PhpBlockCodeGenerator = (
    block: Block,
    generator: PhpGenerator,
) => [string, number] | string | null;

export type PythonBlockCodeGenerator = (
    block: Block,
    generator: PythonGenerator,
) => [string, number] | string | null;

export function installGenerators(generators: Generators = {}, blockName: string,
    jsGenerator?: JsBlockCodeGenerator,
    dartGenerator?: DartBlockCodeGenerator,
    luaGenerator?: LuaBlockCodeGenerator,
    phpGenerator?: PhpBlockCodeGenerator,
    pythonGenerator?: PythonBlockCodeGenerator) {

    if (generators.javascript && jsGenerator) {
        generators.javascript.forBlock[blockName] = jsGenerator;
    }
    if (generators.dart && dartGenerator) {
        generators.dart.forBlock[blockName] = dartGenerator;
    }
    if (generators.lua && luaGenerator) {
        generators.lua.forBlock[blockName] = luaGenerator;
    }
    if (generators.php && phpGenerator) {
        generators.php.forBlock[blockName] = phpGenerator;
    }
    if (generators.python && pythonGenerator) {
        generators.python.forBlock[blockName] = pythonGenerator;
    }
}