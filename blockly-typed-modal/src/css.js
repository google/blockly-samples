/**
 * CSS for workspace search.
 * @type {string}
 */
const CSS_CONTENT = `
  .typed-modal-dialog {
    background-color: white;
    border: 1px solid gray;
    max-width: 50%;
    font-family: Helvetica;
    font-weight: 300;
    padding: 1em;
    width: 400px;
    display: none;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0px 10px 20px grey;
    z-index: 100;
    position: absolute;
  }
  .typed-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
  }
  .typed-modal-dialog-title {
    font-weight: bold;
    font-size: 1em;
  }

  .typed-modal-dialog-input {
    margin: 1em 0 1em 0;
  }
  .typed-modal-dialog-variables ul{
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
  }
  .typed-modal-dialog-variables li {
    margin-right: 1em;
    display: flex;
  }`;

/**
 * Injects CSS for workspace search.
 */
export const injectTypedModalCss = (function() {
  let executed = false;
  return function() {
    // Only inject the CSS once.
    if (executed) {
      return;
    }
    executed = true;
    // const text = CSS_CONTENT.join('\n');
    // Inject CSS tag at start of head.
    const cssNode = document.createElement('style');
    cssNode.id = 'typed-modal-style';
    const cssTextNode = document.createTextNode(CSS_CONTENT);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
  };
})();
