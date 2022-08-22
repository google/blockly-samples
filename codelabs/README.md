
# Blockly Codelabs

This directory is where the Blockly codelabs are authored and stored.
You can browse hosted codelabs at [blocklycodelabs.dev](https://blocklycodelabs.dev/)


## Creating a new Codelab

In order to create a new Codelab, create a new directory and copy ``sample.md``
into it. Give your Codelab a meaningful name, and update the Codelab metadata
which can be found at the top of the markdown file. This includes details such
as a summary, id, categories, and tags. The ``id`` field must be unique across
all Blockly Codelabs.

The sample Codelab runs you through how to author a Codelab using markdown.

You can find additional details on the 
[Codelab Markdown Formatting Guide](https://github.com/googlecodelabs/tools/tree/master/claat/parser/md)

## Adding assets

Put your image assets associated with your codelab in the same folder as your
markdown file. Any images you add can be linked from the Codelab using:
```md
![image_caption](codelabexample.png)
```


## Resources

[Sample Codelab](sample.md)

[Codelab Markdown Formatting Guide](https://github.com/googlecodelabs/tools/tree/master/claat/parser/md)
