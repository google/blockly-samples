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


function allPossibleCombinations(input, length, curstr) {
  if(curstr.length == length) return [ curstr ];
  var ret = [];
  for(var i = 0; i < input.length; i++) {
      ret.push.apply(ret, allPossibleCombinations(input, length, curstr + input[i]));
  }
  return ret;
}

function allThreeLetterCombinations()
{
  var input = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'z', 'x', 'y', 'z', 'w'  ];
  return allPossibleCombinations(input, 3, '')
}

const searchableBlocks =[
  "controls_if",
  "logic_compare",
  "logic_operation",
  "logic_negate",
  "logic_boolean",
  "logic_null",
  "logic_ternary",
  "controls_repeat_ext",
  "controls_repeat",
  "controls_whileUntil",
  "controls_for",
  "controls_forEach",
  "controls_flow_statements",
  "math_number",
  "math_arithmetic",
  "math_single",
  "math_trig",
  "math_constant",
  "math_number_property",
  "math_round",
  "math_on_list",
  "math_modulo",
  "math_constrain",
  "math_random_int",
  "math_random_float",
  "math_atan2",
  "text",
  "text_multiline",
  "text_join",
  "text_append",
  "text_length",
  "text_isEmpty",
  "text_indexOf",
  "text_charAt",
  "text_getSubstring",
  "text_changeCase",
  "text_trim",
  "text_count",
  "text_replace",
  "text_reverse",
  "text_print",
  "text_prompt_ext",
  "lists_create_with",
  "lists_repeat",
  "lists_length",
  "lists_isEmpty",
  "lists_indexOf",
  "lists_getIndex",
  "lists_setIndex",
  "lists_getSublist",
  "lists_split",
  "lists_sort",
  "lists_reverse",
  "colour_picker",
  "colour_random",
  "colour_rgb",
  "colour_blend"
];

suite('BlockSearcher', () => {
  test('indexes the default value of dropdown fields', async () => {
    
    const searcher = new BlockSearcher();
    
    // Text on these:
    // lists_sort: sort <numeric> <ascending>
    // lists_split: make <list from text> with delimiter ,
    searcher.indexBlocks(['lists_sort', 'lists_split']);

    const numericMatches = searcher.blockTypesMatching('numeric');
    assert.sameMembers(['lists_sort'], numericMatches.map(item => item.type));
    assert.sameMembers(['NUMERIC'], numericMatches.map(item => item.fields["TYPE"]));

    const listFromTextMatches = searcher.blockTypesMatching('list from text').map(item => item.type);
    assert.sameMembers(['lists_split'], listFromTextMatches);
  });

  test('is not case-sensitive', () => {
    const searcher = new BlockSearcher();
    searcher.indexBlocks(['lists_create_with']);

    const lowercaseMatches = searcher.blockTypesMatching('create list').map(item => item.type);
    assert.sameMembers(['lists_create_with'], lowercaseMatches);

    const uppercaseMatches = searcher.blockTypesMatching('CREATE LIST').map(item => item.type);
    assert.sameMembers(['lists_create_with'], uppercaseMatches);

    const ransomNoteMatches = searcher.blockTypesMatching('cReATe LiST').map(item => item.type);
    assert.sameMembers(['lists_create_with'], ransomNoteMatches);
  });

  test('Check for duplicates', () => {  
    
    const searcher = new BlockSearcher();

    searcher.indexBlocks(searchableBlocks);
    
    var combinations = allThreeLetterCombinations();
    combinations.forEach(element => {
      const matches = searcher.blockTypesMatching(element).map(item => JSON.stringify(item));
      const matchesSet = new Set(matches);
      assert.equal(matches.length, matchesSet.size);
    });

  });


  test('Check for false negative', () => {
    const searcher = new BlockSearcher();
    
    searcher.indexBlocks(searchableBlocks);
    var checkInString = 0;
    var stringInfo = {};
    searchableBlocks.forEach(element => {
      var itemString = element;
      const blockCreationWorkspace = new Blockly.Workspace();
      const block =  blockCreationWorkspace.newBlock(element);   
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
            if(field.getText()){
              itemString += " " + field.getText();  
            }
            if(field.name){
              itemString += " " + field.name;
            }
            if (field instanceof Blockly.FieldDropdown) {
              field.getOptions(true).forEach((option) => {
                  itemString += " " + option[1];
                  itemString += " " + option[0];                
              });
            }

        });
      }); 
      stringInfo[element] = itemString;        
    });

    var combinations = allThreeLetterCombinations();
    combinations.forEach(element => {
      const matches = searcher.blockTypesMatching(element);
      var checkInString = 0;
      for(var key in stringInfo) {
        if(stringInfo[key].includes(element)){
          var found = false;
          matches.forEach(match => {
            if(match.type == key) {
              found = true;
            }         
          });
          if(!found) {
            assert.equal(found, true); 
          }  
        }        
      }
    });
  });

  test('Check for false positives', () => {
    const searcher = new BlockSearcher();

    searcher.indexBlocks(searchableBlocks);

    var checkInString = 0;

    var combinations = allThreeLetterCombinations();
    combinations.forEach(element => {
      const matches = searcher.blockTypesMatching(element);
      var checkInString = 0;
      matches.forEach(item =>{
        const blockCreationWorkspace = new Blockly.Workspace();
        const block =  blockCreationWorkspace.newBlock(item.type);
        const itemString = JSON.stringify(item);
        var blockInputList = ""
        block.inputList.forEach((input) => {
          input.fieldRow.forEach((field) => {
              blockInputList += " " + field.getText();  
              if (field instanceof Blockly.FieldDropdown) {
                field.getOptions(true).forEach((option) => {
                  if(item.fields[field.name] == option[1]){
                    blockInputList += " " + option[0];
                  }
                });
              }
          });
        });
        if(!itemString.toLowerCase().includes(element) && 
           !blockInputList.toLowerCase().includes(element)){
          checkInString += 1;
        }
      });
      assert.equal(checkInString, 0); 
    });

  });


  test('returns an empty list when no matches are found', () => {
    const searcher = new BlockSearcher();
    assert.isEmpty(searcher.blockTypesMatching('abc123'));
  });
});
