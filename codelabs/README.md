
# Codelabs

This directory is where the Blockly codelabs are authored and stored.


## Creating a new Codelab

In order to create a new Codelab, copy the ``sample.md`` into the ``/codelabs``
directory. Give your Codelab a meaningful name, and update the Codelab metadata
which can be found at the top of the markdown file. This includes details such
as a summary, id, categories, and tags. The ``id`` field must be unique across
all Blockly Codelabs.

The sample Codelab runs you through how to author a Codelab using markdown.

You can find additional details on the 
[Codelab Markdown Formatting Guide](https://github.com/googlecodelabs/tools/tree/master/claat/parser/md)

## Adding assets

Image assets assosicated with your Codelab can be added into the assets directory.
Create a folder in the ``/codelabs/assets`` directory and give it the same name as
your Codelab, keeping the assets directory organized.

Any images added under the assets directory can be linked from the Codelab using:
```md
![image_caption](assets/codelabname/codelabexample.png
```


## Resources

[Sample Codelab](/sample.md)

[Codelab Markdown Formatting Guide](https://github.com/googlecodelabs/tools/tree/master/claat/parser/md)
