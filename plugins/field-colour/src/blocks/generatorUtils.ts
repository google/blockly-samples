/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
