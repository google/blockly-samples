

/**
 * Load the monaco editor.
 * @param {!HTMLElement} container The container element.
 * @param {Object} options Monaco editor options.
 * @param {string=} vsEditorPath Optional VS editor path.
 * @return {Promise} A promise that resolves with the editor.
 */
export function addCodeEditor(container, options, vsEditorPath) {
  return new Promise((resolve, reject) => {
    if (!vsEditorPath) {
      const vsEditorPaths = [
        // monaco-editor is a devDependency of @blockly/dev-tools, look for it
        // there first, otherwise attempt to find it in the local node_modules
        // and finally resort to an online version.
        '../node_modules/@blockly/dev-tools/node_modules/monaco-editor/min/vs',
        '../node_modules/monaco-editor/min/vs',
        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.19.2/min/vs',
      ];
      // Find the VS loader.
      for (let i = 0; i < vsEditorPaths.length; i++) {
        if (checkFileExists(`${vsEditorPaths[i]}/loader.js`)) {
          vsEditorPath = vsEditorPaths[i];
          break;
        }
      }
    }

    const onLoad = () => {
      const amdRequire = /** @type {?} */ (window.require);
      amdRequire.config({
        paths: {'vs': vsEditorPath},
      });

      // Load the monaco editor.
      amdRequire(['vs/editor/editor.main'], () => {
        resolve(createEditor(container, options));
      });
    };

    if (!window.require) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.setAttribute('src', `${vsEditorPath}/loader.js`);
      script.addEventListener('load', onLoad);
      document.body.appendChild(script);
    } else {
      onLoad();
    }
  });
}

/**
 * Create the monaco editor.
 * @param {!HTMLElement} container The container element.
 * @param {Object} options Monaco editor options.
 * @return {monaco.editor.IStandaloneCodeEditor} A monaco editor.
 */
function createEditor(container, options) {
  const editor = window.monaco.editor.create(container, options);
  editor.layout();
  return editor;
}

/**
 * Check whether or not a JS file exists at the url specified.
 * @param {string} url The url of the file.
 * @return {boolean} Whether or not the file exists.
 */
function checkFileExists(url) {
  const http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status != 404;
}

/**
 * Display an error message in the current editor.
 * @param {monaco.editor.IStandaloneCodeEditor} editor The current editor.
 * @param {string} message The error message to display.
 */
export function displayErrorMessage(editor, message) {
  const model = editor.getModel();
  model.setValue(message);

  editor.updateOptions({
    readOnly: true,
    wordWrap: true,
  });
  window.monaco.editor.setModelLanguage(model, 'javascript');
}

/**
 * Display code in the current editor.
 * @param {monaco.editor.IStandaloneCodeEditor} editor The current editor.
 * @param {string} code The code to display.
 * @param {string} language The language of the code.
 * @param {boolean} isReadOnly Whether or not the editor should display in
 *     read-only mode.
 */
export function displayCode(editor, code, language, isReadOnly) {
  const model = editor.getModel();
  window.monaco.editor.setModelLanguage(model, language);
  model.setValue(code);

  editor.updateOptions({
    readOnly: isReadOnly,
    wordWrap: false,
  });
}
