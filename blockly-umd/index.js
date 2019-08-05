/**
 * @license
 * 
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Example of including Blockly using the UMD bundle
 * @author samelh@google.com (Sam El-Husseini)
 */

document.addEventListener("DOMContentLoaded", function () {

    var toolbox = document.getElementById('toolbox');
    var workspace = Blockly.inject('blocklyDiv',
        {
            comments: true,
            collapse: true,
            disable: true,
            grid:
            {
                spacing: 25,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            toolbox: toolbox,
            zoom:
            {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 4,
                minScale: 0.25,
                scaleSpeed: 1.1
            }
        });

});