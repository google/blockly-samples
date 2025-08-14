const fs = require('fs');

// e.g. node_modules/blockly/index.js
const blocklyIndex = require.resolve('blockly');

// Get the media directory instead of the index
const mediaPath = blocklyIndex.replace('index.js', 'media');

fs.cp(mediaPath, './public/media', {recursive: true}, (err) => {
  if (err) throw err;
});
