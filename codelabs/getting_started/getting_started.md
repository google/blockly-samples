author: Rachel Fenichel, ewag
summary: In this codelab, you’ll add Blockly editor to a simple web app, to allow users to program their own music keys.
id: blockly-getting-started
categories: blockly,codelab,MORE CATEGORIES
status: Draft
Feedback Link: https://github.com/google/blockly-samples/issues/new

# Getting started with Blockly

## Codelab overview

### What you'll learn

This codelab will teach you how to modify a simple web app to include the [Blockly](https://developers.google.com/blockly/) visual programming library.

### What is Blockly?

Blockly is a library for building block programming apps.

Block programming allows users to create scripts and programs by using visual blocks, even if they do not know any programming language.

Blockly includes everything you need for defining and rendering blocks in a drag-n-drop editor. Each block represents a chunk of code that can be easily stacked and translated into code.

### What you'll build

MusicMaker, a web  app where you can program buttons to play different sounds, using Blockly.

### What you'll need

-  A browser
-  A text editor
-  Basic knowledge of HTML, CSS and JavaScript
-  The starter code, see **Get setup** section for instructions

This codelab is focused on Blockly. The app structure, non-relevant concepts and code are glossed over and are provided for you to simply copy and paste.

## Setup

### Download the sample code

You can get the sample code for this code by either downloading the zip here:

[Download zip](https://github.com/google/blockly-samples/archive/master.zip)

or by cloning this git repo:

```bash
git clone https://github.com/google/blockly-samples.git
```

If you downloaded the source as a zip, unpacking it should give you a root folder `blockly-samples-master`.

The relevant files are in `examples/getting-started-codelab`. There are two versions of the app:
- `starter-code/`: The starter code that you'll build upon in this codelab.
- `complete-code/`: The code after completing the codelab, in case you get lost or want to compare to your version.

Each folder contains:
- `scripts/`
- `sounds/`
- `styles/`
- `index.html`

## Explore the app

To run the app, simply open `starter-code/index.html` in a browser.

### Play Mode

By default, the app launches in "**Play Mode**". In this mode, you can see 9 buttons. None of them can do anything yet. The idea is to let user define custom behaviors for each button, using Blockly.

![image](insert_image_url_here)

### Edit mode

By tapping the **EDIT** button, you can switch to edit mode. In this mode, tapping a button will display an editor, which is where you can program how sounds should play for that button. For now, the editor screen is empty.

![image](insert_image_url_here)

You can go back to the play mode by tapping **SAVE** and then **DONE** buttons.

## Add Blockly libraries

Now that you know what you'll be building, you need to add Blockly dependencies to your app.

Blockly releases are [published on npm](https://www.npmjs.com/package/blockly) on a quarterly basis. For this codelab you will import blockly using [unkpg](https://unpkg.com), which lets you import all of the files you need with a single script tag.

Open `starter-code/index.html` in a text editor and scroll to the end. You can see two script tags:

```html
<script src="scripts/music_maker.js"></script>
<script src="scripts/main.js"></script>
```

`main.js` contains the main logic for the app. In the starter project it has all the code needed to navigate and switch between views in the basic app.

`music_maker.js` is a small library to play sounds. We will use it to actually play sounds in the browser.

Add Blockly just before these two scripts. The order is important, because you will use Blockly objects later in `main.js`.

```html
<script src="https://unpkg.com/blockly/blockly.min.js"></script>
<script src="scripts/music_maker.js"></script>
<script src="scripts/main.js"></script>
```

### Default imports

Importing Blockly this way loads four default modules.
- Blockly core: The main Blockly library, which defines the basic Blockly UI and logic.
- Built-in block definitions: Common blocks such as loops, logic, math, and string manipulation.
- The JavaScript generator: Converts blocks into JavaScript, and contains block generators for all built-in blocks.
- English language files: String tables for all messages on built-in blocks and the Blockly UI, in English.

### Alternate imports

There are many ways to import a library in JavaScript, and this tutorial does not cover all of them. For samples that show how to integrate Blockly in your project, look at the `examples` folder in [blockly-samples](https://github.com/google/blockly-samples).

You can also define your imports more carefully, to get [different generators](https://www.npmjs.com/package/blockly#blockly-generators) and [locales](https://www.npmjs.com/package/blockly#blockly-languages).

## Add Blockly workspace

A Blockly editor is created with a call to `Blockly.inject(container, options)`. This function takes two arguments:
- `container` is where the Blockly workspace should be placed on the page. It can be an `Element`, an ID string, or a CSS selector.
- `options` is a dictionary of configuration options.

In `index.html`, in the `<main>` section, you can see a div with the id `"blockly-div"`:

```html
<div id="blockly-div" style="height: 480px; width: 400px;"></div>
```

This is where we will insert a Blockly editor. The div has a defined width and height, because we will insert a [fixed size workspace](https://developers.google.com/blockly/guides/configure/web/fixed-size) into it.

A Blockly workspace consists of two parts:
- An area where the blocks to be converted to code are assembled
- A toolbox containing all blocks that are available to user.

![image](insert_image_url_here)


### Define Blockly toolbox

TODO (fenichel): Decide whether to use the new JSON representation (not until it's released and debugged?)
TODO (fenichel): Use es6 for sample code, and use a multiline string here.

Let's define the toolbox. Add the structure of the toolbox just after the `blockly-div`:

```xml
<xml id="toolbox" style="display: none">
  <category name="Loops" colour="120">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">5</field>
        </shadow>
      </value>
    </block>
  </category>
</xml>
```

This XML defines a toolbox with a single "repeat loop" block inside a single category named "Loops".


For more information on this XML format and toolbox configuration, click <a href="https://developers.google.com/blockly/guides/configure/web/toolbox">here</a>.

We set the display style of the toolbox to `none`, because we do not intend to display the XML structure on our web page - it will be just used to construct the toolbox programmatically.

### Add Blockly workspace to the edit view

Now open `scripts/main.js`. Just before the end of the main function, add code to inject Blockly editor:

```js
Blockly.inject('blockly-div', {
  toolbox: document.getElementById('toolbox'),
  toolboxPosition: 'end',
  horizontalLayout: true,
  scrollbars: false
});
```

Let's look at the options we used to initiate blockly editor:

- `media`: A directory where blockly can find the assets it is using, like icons etc.
- `toolbox`: An XML element which defines the toolbox for the editor
- `toolboxPosition`: Where the toolbox should be positioned
- `horizontalLayout`: Layout type, can be horizontal or vertical
- `scrollbars`: whether to show scrollbars in the workspace.

Now refresh the page. Select the EDIT mode, then tap on one of the buttons. You should see a Blockly editor:

![image](insert_image_url_here)

Tap on the Loops category. You should be able to drag and drop the available loop block to the workspace and back.

## Create custom block


Next, we want to add a custom "play sound" block to our workspace:

![image](insert_image_url_here)

### Create sound block script file.

To define a custom block in Blockly, it must be specified inside a js file. Create a JS file to define a new "play sound" block:

1. Add `sound_blocks.js` file in the `scripts` directory.
1. Add the following code to `sound_blocks.js`:

```js
Blockly.defineBlocksWithJsonArray([
  {
    "type": "play_sound",
    "message0": "Play %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VALUE",
        "options": [
          ["C4", "sounds/c4.m4a"],
          ["D4", "sounds/d4.m4a"],
          ["E4", "sounds/e4.m4a"],
          ["F4", "sounds/f4.m4a"],
          ["G4", "sounds/g4.m4a"],
          ["A5", "sounds/a5.m4a"],
          ["B5", "sounds/b5.m4a"],
          ["C5", "sounds/c5.m4a"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 355,
    "tooltip": "",
    "helpUrl": ""
  }
]);
````

The JSON inside `defineBlocksWithJsonArray` call describes how the block looks like, e.g. its color, content, types of connectors etc. The `type: "play_sound"` property defines the block's name, which we will use to inject the block to our workspace.

For more information on the JSON structure defining the block, click <a href="https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks">here</a>.

### Add the sound block to the toolbox

![image](insert_image_url_here)

```html
<script src="scripts/sound_blocks.js"></script>
```

Now we can update the toolbox to include the new sound block.

The XML structure for toolbox already contains a "**Loops**" category. After that category, add a "**Sounds**" category that includes our custom `play_sound` block:

```xml
<xml>
  <category name="Loops" colour="120">
    ...
  </category>
  <category name="Sounds" colour="170">
    <block type="play_sound"></block>
  </category>
<br>
</xml>
```

Run the app one more time, and play around with the new "**Sounds**" category and the new "Play (sound)" block. It should look like this:

![image](insert_image_url_here)

This step discussed how to manually define custom blocks in Blockly. Once you've completed the entire codelab, we recommend that you check out our <a href="https://developers.google.com/blockly/guides/create-custom-blocks/blockly-developer-tools">developer tools</a>, which helps automate part of this process.

## Save/load workspace

Once the button behavior is defined by the user, it needs to be saved for later use.

### Add the save method

Open `scripts/main.js`. Add the following code to the `save()` method:

```js
let xml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
button.blocklyXml = xml;
```

This method takes the Blockly workspace, exports it to an XML DOM structure and stores it in a `blocklyXml` property on the button. This way an exported xml for the block sequence gets associated with a particular button.

### Add the load method

Similarly, when a user opens the editor, the blocks previously associated with this button should get loaded into the workspace.

In the `scripts/main.js `file, add `loadWorkspace` function:

```
function loadWorkspace(button) {
  let workspace = Blockly.getMainWorkspace();
  workspace.clear();
  if (button.blocklyXml) {
    Blockly.Xml.domToWorkspace(button.blocklyXml, workspace);
  }
}
```

It clears the workspace from any blocks and then loads the blocks defined in the XML in `blocklyXml` property of the clicked button.

Call this function from `enableBlocklyMode `method:

```
function enableBlocklyMode(e) {
  ...
  loadWorkspace(currentButton);
}
```

Now, test the code. Edit the workspace for one of the buttons, add some blocks, save it, and reopen it. The workspace should still contain the blocks you added.

## Generate JavaScript code

Now that each button can be configured with its own Blockly workspace, the next thing we want to do is to generate JavaScript code from each workspace.

This generated code will be run by the browser, effectively executing the blocks set up in the Blockly workspace.

### Add a blockly generator for javascript

Blockly can generate code from blocks for different languages, e.g. JavaScript, Python, or PHP. Let's add the JavaScript generator to our app.

![image](insert_image_url_here)

```html
<script src="../../../javascript_compressed.js"></script>
```

It will be used by `sound_blocks.js`, so be sure to add the script tag for `javascript_compressed.js` above the `sound_blocks.js` script.

### Add a JavaScript generator for the sound block

When Blockly generates JavaScript code for blocks in a workspace, it translates each block into code. By default, it knows how to translate all library-provided default blocks into JavaScript code. However, for any custom blocks, we need to specify our own translation functions (aka. code generators).

![image](insert_image_url_here)

```js
Blockly.JavaScript['play_sound'] = function(block) {
  var value = '\'' + block.getFieldValue('VALUE') + '\'';
  return 'MusicMaker.queueSound(' + value + ');\n';
};
```

With this translation function, the following `play_sound` block:

![image](insert_image_url_here)

translates into the JavaScript code "`MusicMaker.queueSound('Sounds/c4.m4a');`".

## Run generated code

When a button is pressed, we want to execute the custom code associated with it.

![image](insert_image_url_here)

First, load the workspace content associated with the pressed button:

```js
loadWorkspace(event.target);
```

Next, generate the code out of that workspace:

```js
Blockly.JavaScript.addReservedWords('code');
var code = Blockly.JavaScript.workspaceToCode(
  Blockly.getMainWorkspace());
code += 'MusicMaker.play();';
```

Because the code is "written" by the user, we do not have full control over its contents. This is why we added `'code'` to the list of reserved words so that if the user's code contains a variable of that name it will be automatically renamed instead of colliding.

The user's code will consist of many `MusicMaker.queueSound` calls. At the end of our generated script, add `MusicMaker.play `call to play all the sounds added to the queue.

Finally, execute the script with the eval function. Wrap it in a try/catch so that any runtime errors are logged to the console, instead of failing quietly.:

```js
try {
  eval(code);
} catch (error) {
  console.log(error);
}
```

The end result should look like this:

```js
function handlePlay(event) {
  loadWorkspace(event.target);
  Blockly.JavaScript.addReservedWords('code');
  var code = Blockly.JavaScript.workspaceToCode(
      Blockly.getMainWorkspace());
  code += 'MusicMaker.play();';
  try {
    eval(code);
  } catch (error) {
    console.log(error);
  }
}
```

Executing scripts with eval is not always the safest option - we use it here for simplicity. If you intend to run the user's blocks in production, check out the <a href="https://github.com/NeilFraser/JS-Interpreter">JS Interpreter project</a>. This project is separate from Blockly, but was specifically written for Blockly.

Run the app and try it out! Edit one of the button to play a C4 sound 5 times:

![image](insert_image_url_here)

Save and exit the edit mode. Now if you tap this button, you should hear the C4 sound played 5 times.

## The End

![image](insert_image_url_here)

For more documentation, visit the [Blockly developer site](https://developers.google.com/blockly/).

Additionally, Blockly has an active [developer forum](https://groups.google.com/forum/#!forum/blockly). Please drop by and say hello. We're happy to answer any questions or give advice on best practices for building an app with Blockly. Feel free to show us your prototypes early; collectively we have a lot of experience and can offer hints which will save you time.

And if you are an active Blockly developer, help us focus our development efforts by telling us [what you are doing with Blockly](https://goo.gl/forms/kZTsO9wGLmpoPXC02). The questionnaire only takes a few minutes and will help us better support the Blockly community.
