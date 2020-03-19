/**
 * CSS for workspace search.
 * @type {string}
 */
const CSS_CONTENT = `
  .typed-modal-dialog-title {
    font-weight: bold;
    font-size: 1em;
  }

  .typed-modal-dialog-input-wrapper {
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


