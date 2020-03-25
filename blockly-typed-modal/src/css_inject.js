
/**
 * Injects CSS.
 */
export const injectCss = (function() {
  let cssAdded = [];
  return function(id, css) {
    // Only inject the CSS once.
    if (cssAdded.indexOf(id) > -1) {
      return;
    }
    cssAdded.push(id);
    // Inject CSS tag at start of head.
    const cssNode = document.createElement('style');
    cssNode.id = id;
    const cssTextNode = document.createTextNode(css);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
    return cssNode;
  };
})();
