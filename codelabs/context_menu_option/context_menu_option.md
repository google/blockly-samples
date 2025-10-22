author: Blockly Team
summary: How to add a context menu option in Blockly.
id: context-menu-option
categories: blockly,codelab,contextmenu
status: Published
Feedback Link: https://github.com/google/blockly-samples/issues/new/choose

# Customizing your context menus

## Codelab overview

### What you'll learn

In this codelab you will learn how to:
- Add a context menu option to the workspace.
- Add a context menu option to all blocks.
- Use precondition functions to hide or disable context menu options.
- Take an action when a menu option is clicked.
- Customize ordering and display text for context menu options.

### What you'll build
A very simple Blockly workspace with a few new context menu options.

### What you'll need
- A browser.
- A text editor.
- Basic knowledge of HTML, CSS, and JavaScript.

This codelab is focused on Blockly's context menus. Non-relevant concepts and code are glossed over and are provided for you to simply copy and paste.

## Setup

### Download the sample code

You can get the sample code for this code by either downloading the zip here:

[Download zip](https://github.com/google/blockly-samples/archive/master.zip)

or by cloning this git repo:

```bash
git clone https://github.com/google/blockly-samples.git
```

If you downloaded the source as a zip, unpacking it should give you a root folder named `blockly-samples-master`.

The relevant files are in `examples/context-menu-codelab`. There are two versions of the app:
- `starter-code/`: The starter code that you'll build upon in this codelab.
- `complete-code/`: The code after completing the codelab, in case you get lost or want to compare to your version.

Each folder contains:
- `index.js` - The codelab's logic. To start, it just injects a simple workspace.
- `index.html` - A web page containing a simple blockly workspace.

To run the code, simple open `starter-code/index.html` in a browser. You should see a Blockly workspace with an always-open flyout.

![A web page with the text "Context Menu Codelab" and a simple Blockly workspace.](starter_workspace.png)

## Add a context menu item

In this section you will create a very basic `Blockly.ContextMenuRegistry.RegistryItem`, then register it to display when you right-click on the workspace, a block, or a comment.

### The RegistryItem

A context menu consists of one or more menu options that a user can click. Blockly stores information about menu option as items in a registry. You can think of the _registry items_ as templates for constructing _menu options_. When the user right-clicks, Blockly retrieves all of the registry items that apply to the current context and uses them to construct a list of menu options.

Each item in the registry has several properties:

- `displayText`: The text to show in the menu. Either a string, or HTML, or a function that returns either of the former.
- `preconditionFn`: Function that returns one of `'enabled'`, `'disabled'`, or `'hidden'` to determine whether and how the menu option should be rendered.
- `callback`: A function called when the menu option is clicked.
- `id`: A unique string id for the item.
- `weight`: A number that determines the sort order of the option. Options with higher weights appear later in the context menu.

We will discuss these in detail in later sections of the codelab.


### Make a RegistryItem

Add a function to `index.js` named `registerHelloWorldItem`. Create a new registry item in your function:

```js
function registerHelloWorldItem() {
    const helloWorldItem = {
      displayText: 'Hello World',
      preconditionFn: function(scope) {
        return 'enabled';
      },
      callback: function(scope) {
      },
      id: 'hello_world',
      weight: 100,
    };
}
```

Call your function from `start`:

```js
function start() {
  registerHelloWorldItem();

  Blockly.ContextMenuItems.registerCommentOptions();
  // Create main workspace.
  workspace = Blockly.inject('blocklyDiv',
    {
      toolbox: toolboxSimple,
    });
}
```

### Register it

Next, register your item with Blockly:

```js
function registerHelloWorldItem() {
  const helloWorldItem = {
    // ...
  };
  Blockly.ContextMenuRegistry.registry.register(helloWorldItem);
}
```

Note: you will never need to make a new `ContextMenuRegistry`. Always use the singleton `Blockly.ContextMenuRegistry.registry`.

### Test it

Reload your web page and right-click on the workspace. You should see a new option labeled "Hello World" at the bottom of the context menu.

![A context menu. The last option says "Hello World".](hello_world.png)

Next, drag a block onto the workspace and right-click on the block. You'll see "Hello World" at the bottom of the block's context menu. Finally, right-click on the workspace and create a comment, then right-click on the comment's header. "Hello World" should be at the bottom of the context menu. 

## Precondition: Node type

Each registry item has a `preconditionFn`. It is called by Blockly to decide whether and how to display an option on a context menu. You'll use it to display the "Hello, World" option on workspace and block context menus, but not on comment context menus.

### The scope argument

The `scope` argument is an object that is passed to `preconditionFn`. You'll use the `scope.focusedNode` property to determine which object the context menu was invoked on. Why a focused node? Because all Blockly components that support context menus implement the `IFocusableNode` interface, so it's a handy way to pass objects (like workspaces, blocks, and comments) that otherwise have nothing in common.

### Return value

The return value of `preconditionFn` is `'enabled'`, `'disabled'`, or `'hidden'`. An **enabled** option is shown with black text and is clickable. A **disabled** option is shown with grey text and is not clickable. A **hidden** option is not included in the context menu at all.

### Write the function 

You can now test `scope.focusedNode` to display the "Hello World" option in workspace and block context menus, but not on any others. Change `preconditionFn` to:

```js
  const helloWorldItem = {
    ...
    preconditionFn: function (scope) {
      if (scope.focusedNode instanceof Blockly.WorkspaceSvg ||
          scope.focusedNode instanceof Blockly.BlockSvg) {
        return 'enabled';
      }
      return 'hidden';
    },
    ...
  };
```

### Test it

Right-click the workspace, a block, and a comment. You should see a "Hello World" option on the workspace and block context menus, but not on the comment context menu.

![An if block with a context menu with five options. The last option says "Hello World".](hello_world_block.png)

## Precondition: External state

Use of the `preconditionFn` is not limited to checking the type of the Blockly component that the context menu was invoked on. You can use it to check for conditions entirely outside of Blockly. For instance, let's disable `helloWorldItem` for the second half of every minute:

```js
    preconditionFn: function (scope) {
      if (scope.focusedNode instanceof Blockly.WorkspaceSvg ||
          scope.focusedNode instanceof Blockly.BlockSvg) {
        const now = new Date(Date.now());
        if (now.getSeconds() < 30) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
```

### Test it

Reload your workspace, check your watch, and right-click on the workspace to confirm the timing. The option will always be in the menu, but will sometimes be greyed out.

![A context menu. The last option says "Hello World" but the text is grey, indicating that it cannot be selected.](hello_world_grey.png)

## Precondition: Blockly state

Disabling your context menu options half of the time is not useful, but you may want to show or hide an option based on what the user is doing. For example, let's show a **Help** option in the context menu if the user doesn't have any blocks on the workspace. Add this code in `index.js`:

```js
function registerHelpItem() {
  const helpItem = {
    displayText: 'Help! There are no blocks',
    preconditionFn: function(scope) {
      if (!(scope.focusedNode instanceof Blockly.WorkspaceSvg)) return 'hidden';
      if (!scope.focusedNode.getTopBlocks().length) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
    },
    id: 'help_no_blocks',
    weight: 100,
  };
  Blockly.ContextMenuRegistry.registry.register(helpItem);
}
```

Don't forget to call `registerHelpItem` from your `start` function.

### Test it

- Reload your page and right-click on the workspace. You should see an option labeled "Help! There are no blocks".
- Add a block to the workspace and right-click on the workspace again. The **Help** option should be gone.

## Callback

The callback function determines what happens when you click on the context menu option. Like the precondition, it can use the `scope` argument to access the Blockly component on which the context menu was invoked.

It is also passed a `PointerEvent` which is the original event that triggered opening the context menu (not the event that selected the current option). This lets you, for example, figure out where on the workspace the context menu was opened so you can create a new element there.

As an example, update the help item's `callback` to add a block to the workspace when clicked:

```js
callback: function(scope) {
  Blockly.serialization.blocks.append({
    'type': 'text',
    'fields': {
      'TEXT': 'Now there is a block'
    }
  }, scope.focusedNode);
}
```

### Test it

- Reload the page and right-click on the workspace.
- Click the **Help** option.
- A text block should appear in the top left of the workspace.


![A text block containing the text "Now there is a block".](there_is_a_block.png)

## Display text

So far the `displayText` has always been a simple string, but it can also be HTML, or a function that returns either of the former. Using a function can be useful when you want a context-dependent message.

When defined as a function `displayText` accepts a `scope` argument, just like `callback` and `preconditionFn`.

As an example, add this registry item. The display text depends on the block type.

```js
function registerDisplayItem() {
  const displayItem = {
    displayText: function(scope) {
      if (scope.focusedNode.type.startsWith('text')) {
        return 'Text block';
      } else if (scope.focusedNode.type.startsWith('controls')) {
        return 'Controls block';
      } else {
        return 'Some other block';
      }
    },
    preconditionFn: function(scope) {
      return scope.focusedNode instanceof Blockly.BlockSvg ? 'enabled' : 'hidden';
    },
    callback: function(scope) {
    },
    id: 'display_text_example',
    weight: 100,
  };
  Blockly.ContextMenuRegistry.registry.register(displayItem);
}
```

As usual, remember to call `registerDisplayItem()` from your `start` function.

### Test it

- Reload the workspace and right-click on various blocks.
- The last context menu option's text should vary based on the block type.

## Weight and id

The last two properties of a registry item are `weight` and `id`.

### Weight

The `weight` property is a number that determines the order of the options in the context menu. A higher number means your option will be lower in the list.

Test this by updating the `weight` property on one of your new registry items and confirming that the corresponding option moves to the top or bottom of the list.

Note that weight does not have to be positive or integer-valued.

### Id

Every registry item has an `id` that can be used to unregister it. You can use this to get rid of registry items that you don't want.

For instance, you can remove the item that deletes all blocks on the workspace:

```js
Blockly.ContextMenuRegistry.registry.unregister('workspaceDelete');
```

### Default items

For a list of the default registry items that Blockly provides, look at [contextmenu_items.ts](https://github.com/google/blockly/blob/master/core/contextmenu_items.ts). Each entry contains both the `id` and the `weight`.

## Separators

You can use separators to break your context menu into different sections.

Separators differ from other items in two ways: They cannot have `displayText`, `preconditionFn`, or `callback` properties and they can only be scoped with the `scopeType` property. The latter accepts an enum value of `Blockly.ContextMenuRegistry.ScopeType.WORKSPACE`, `Blockly.ContextMenuRegistry.ScopeType.BLOCK`, or `Blockly.ContextMenuRegistry.ScopeType.COMMENT`.

Use the `weight` property to position the separator. You'll use a weight of `99` to position the separator just above the other options you added, all of which have a weight of `100`.

You need to add a separate item for each separator:

```js
function registerSeparators() {
  const workspaceSeparator = {
    id: 'workspace_separator',
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    weight: 99,
    separator: true,
  }
  Blockly.ContextMenuRegistry.registry.register(workspaceSeparator);

  const blockSeparator = {
    id: 'block_separator',
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    weight: 99,
    separator: true,
  }
  Blockly.ContextMenuRegistry.registry.register(blockSeparator);
};
```

As usual, remember to call `registerSeparators()` from your `start` function.

### Test it

Right-click the workspace and a block and check that the separator line is there.

## Summary

In this codelab you have learned how to create and modify context menu options. You have learned about scope, preconditions, callbacks, and display text.

### Additional information

- [Context menu documentation](https://developers.google.com/blockly/guides/configure/web/context-menus)

- You can also define [block context menus](https://developers.google.com/blockly/guides/configure/web/context-menus#customize_per_block) directly on a block definition, which is equivalent to adding a precondition based on the type of the block.
