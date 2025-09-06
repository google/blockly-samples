import {assert} from 'chai';
import * as Blockly from 'blockly';
import {ToolboxSearchCategory} from '../src/toolbox_search';
import {BlockSearcher} from '../src/block_searcher';

suite('Toolbox search', () => {
  test('registers itself as a toolbox item', () => {
    assert(
      Blockly.registry.hasItem(
        Blockly.registry.Type.TOOLBOX_ITEM,
        ToolboxSearchCategory.SEARCH_CATEGORY_KIND,
      ),
    );
  });
});

suite('BlockSearcher', () => {
  test('indexes the default value of dropdown fields', () => {
    const searcher = new BlockSearcher();
    const blocks = [
      {
        kind: 'block',
        type: 'lists_sort',
      },
      {
        kind: 'block',
        type: 'lists_split',
      },
    ];
    // Text on these:
    // lists_sort: sort <numeric> <ascending>
    // lists_split: make <list from text> with delimiter ,
    searcher.indexBlocks(blocks);

    const numericMatches = searcher.blockTypesMatching('numeric');
    assert.sameMembers(numericMatches, [blocks[0]]);

    const listFromTextMatches = searcher.blockTypesMatching('list from text');
    assert.sameMembers(listFromTextMatches, [blocks[1]]);
  });

  test('is not case-sensitive', () => {
    const searcher = new BlockSearcher();
    const listCreateWithBlock = {
      kind: 'block',
      type: 'lists_create_with',
    };
    searcher.indexBlocks([listCreateWithBlock]);

    const lowercaseMatches = searcher.blockTypesMatching('create list');
    assert.sameMembers(lowercaseMatches, [listCreateWithBlock]);

    const uppercaseMatches = searcher.blockTypesMatching('CREATE LIST');
    assert.sameMembers(uppercaseMatches, [listCreateWithBlock]);

    const ransomNoteMatches = searcher.blockTypesMatching('cReATe LiST');
    assert.sameMembers(ransomNoteMatches, [listCreateWithBlock]);
  });

  test('returns an empty list when no matches are found', () => {
    const searcher = new BlockSearcher();
    assert.isEmpty(searcher.blockTypesMatching('abc123'));
  });

  test('returns preset blocks', () => {
    const searcher = new BlockSearcher();
    const blocks = [
      {
        kind: 'block',
        type: 'text_replace',
        inputs: {
          FROM: {
            shadow: {
              type: 'text',
            },
          },
          TO: {
            shadow: {
              type: 'text',
            },
          },
          TEXT: {
            shadow: {
              type: 'text',
            },
          },
        },
      },
    ];

    searcher.indexBlocks(blocks);

    const matches = searcher.blockTypesMatching('replace');
    assert.sameMembers(matches, [blocks[0]]);
  });
});
