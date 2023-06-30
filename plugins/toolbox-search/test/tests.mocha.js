import {assert} from 'chai';
import * as Blockly from 'blockly';
import {ToolboxSearchCategory} from '../src/toolbox_search';
import {BlockSearcher} from '../src/block_searcher';

suite('Toolbox search', () => {
  test('registers itself as a toolbox item', () => {
    assert(
        Blockly.registry.hasItem(
            Blockly.registry.Type.TOOLBOX_ITEM,
            ToolboxSearchCategory.SEARCH_CATEGORY_KIND));
  });
});

suite('BlockSearcher', () => {
  test('indexes the default value of dropdown fields', () => {
    const searcher = new BlockSearcher();
    // Text on these:
    // lists_sort: sort <numeric> <ascending>
    // lists_split: make <list from text> with delimiter ,
    searcher.indexBlocks(['lists_sort', 'lists_split']);

    const numericMatches = searcher.blockIdsMatching('numeric');
    assert.sameMembers(['lists_sort'], numericMatches);

    const listFromTextMatches = searcher.blockIdsMatching('list from text');
    assert.sameMembers(['lists_split'], listFromTextMatches);
  });

  test('is not case-sensitive', () => {
    const searcher = new BlockSearcher();
    searcher.indexBlocks(['lists_create_with']);

    const lowercaseMatches = searcher.blockIdsMatching('create list');
    assert.sameMembers(['lists_create_with'], lowercaseMatches);

    const uppercaseMatches = searcher.blockIdsMatching('CREATE LIST');
    assert.sameMembers(['lists_create_with'], uppercaseMatches);

    const ransomNoteMatches = searcher.blockIdsMatching('cReATe LiST');
    assert.sameMembers(['lists_create_with'], ransomNoteMatches);
  });

  test('returns an empty list when no matches are found', () => {
    const searcher = new BlockSearcher();
    assert.isEmpty(searcher.blockIdsMatching('abc123'));
  });
});
