import * as Blockly from 'blockly';

type blockStack = {
    blockList: Array<Blockly.BlockSvg>;
    first: Blockly.BlockSvg;
    firstPrev: Blockly.BlockSvg | null;
    last: Blockly.BlockSvg;
    lastNext: Blockly.BlockSvg | null;
};

// Go through the selected block set and compress it down into a list of contiguous block stacks.
export function combineBlocks(workspace: Blockly.WorkspaceSvg, blocks: Set<string>) {
    const listOfLists: blockStack[] = createBlockList(workspace, blocks);

    for (let outerIndex = 0; outerIndex < listOfLists.length; outerIndex++) {
        const source = listOfLists[outerIndex];
        let startListLength;
        do {
            startListLength = listOfLists.length;
            doCombinePass(listOfLists, outerIndex, source);
        } while (startListLength != listOfLists.length);
    }
    // Returns an array of blockStacks.
    return listOfLists;
}

// Build a list of blockStacks from the set of selected block IDs.
function createBlockList(workspace: Blockly.WorkspaceSvg, blocks: Set<string>) {
    const blockList: Array<Blockly.BlockSvg> = [];
    blocks.forEach((id) => blockList.push(workspace.getBlockById(id)!));

    // Filter out blocks that around inside the statement input of other blocks in the selection set.
    // There are cases this won't handle
    // (e.g. three levels of statement inputs and the middle one is not in the selection set)
    const filteredList = blockList.filter((item) => {
        const surroundParent = item.getSurroundParent();
        return (!surroundParent || blockList.indexOf(surroundParent) == -1);
    })

    return filteredList.map((block) => {
        return {
            blockList: [block],
            first: block,
            firstPrev: block.previousConnection?.targetBlock(),
            last: block,
            lastNext: block.nextConnection?.targetBlock()
        };
    });
}

// Combine two contiguous stacks into one and update the array.
// Does nothing if no stacks can be combined with source.
function doCombinePass(listOfLists: Array<blockStack>, outerIndex: number, source: blockStack) {
    for (let innerIndex = outerIndex + 1; innerIndex < listOfLists.length; innerIndex++) {
        const candidate = listOfLists[innerIndex];
        if (candidate.firstPrev != null && candidate.firstPrev == source.last) {
            // Add candidate at the end of source
            listOfLists.splice(innerIndex, 1);
            source.blockList.push(...candidate.blockList);
            source.last = candidate.last;
            source.lastNext = candidate.lastNext;
            return;
        } else if (candidate.lastNext != null && candidate.lastNext == source.first) {
            // Add candidate at the beginning of source
            listOfLists.splice(innerIndex, 1);
            source.blockList = candidate.blockList.concat(source.blockList);
            source.first = candidate.first;
            source.lastNext = candidate.firstPrev;
            return;
        }
    }
}

