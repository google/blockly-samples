/**
 * A cache of all the plugin / example links on the page, used to show / hide
 * all elements.
 * @type {Array<!HTMLELement>}
 */
var linkEls;

/**
 * A cache of all the plugin / example links on the page with their associated
 * text, used by the Fuse search.
 * @type {Array<{text: string, el: !HTMLElement}>}
 */
var links;

/**
 * A cache of all the text elements (eg: h1, h2) on the page, which are hidden
 * when searching.
 * @type {Array<!HTMLELement>}
 */
var textEls;

/**
 * A cache of all the ul elements on the page, which reduce their margins when
 * searching.
 * @type {Array<!HTMLELement>}
 */
var ulEls;

/**
 * The Fuse fuzzy search instance.
 * @type {Fuse}
 */
var fuse;

/**
 * Handle search box input.
 * @param {KeyboardEvent} e The keyboard event.
 */
function searchBoxInputHandler(e) {
  var value = e.target.value;
  
  if (!value) {
    // Show / Reset all.
    linkEls.forEach(function(link) {
      link.style.display = '';
      link.parentElement.style.display = '';
      link.className = '';
    });
    textEls.forEach(function(text) {
      text.style.display = '';
    });
    ulEls.forEach(function(ul) {
      ul.className = '';
    });
    return;
  }

  // Hide all text elements for searching.
  textEls.forEach(function(text) {
    text.style.display = 'none';
  });
  // Reduce the margin of all ul elements for searching.
  ulEls.forEach(function(ul) {
    ul.className = 'fluid';
  });

  var selectedEl = document.querySelector('main.index li a.selected');

  var search = fuse.search(value);
  var searchEls = search.map(function (e) {
    return e.item.el;
  });
  var visibleLinks = [];
  linkEls.forEach(function(link) {
    const shouldHide = searchEls.indexOf(link) < 0;
    link.style.display = shouldHide ? 'none' : '';
    link.parentElement.style.display = shouldHide ? 'none' : '';
    link.className = shouldHide ? '' :
        ('visible' + (selectedEl === link ? ' selected' : ''));
    if (!shouldHide) {
      visibleLinks.push(link);
    }
  });

  // Go through the visible links, and if selectedEl is not one of them,
  // replace it.
  if (visibleLinks.length && visibleLinks.indexOf(selectedEl) < 0) {
    if (selectedEl) selectedEl.className = '';
    visibleLinks[0].className = 'visible selected';
  }
}

/**
 * Handles search box keydown events.
 * @param {KeyboardEvent} e The keyboard event.
 */
function searchBoxKeyDownHandler(e) {
  var selectedEl = document.querySelector('main.index li a.selected');
  if (e.key == 'Enter') {
    if (selectedEl) {
      selectedEl.click();
    }
  } else if (e.key == 'ArrowUp' ||
    e.key == 'ArrowDown' ||
    e.key == 'ArrowLeft' ||
    e.key == 'ArrowRight') {
    var visibleEls =
        Array.from(document.querySelectorAll('main.index li a.visible'));
    if (!visibleEls || !visibleEls.length) {
      return;
    }
    if (!selectedEl) {
      visibleEls[0].className = 'visible selected';
      return;
    }
    var index = visibleEls.indexOf(selectedEl);
    if (e.key == 'ArrowLeft' || e.key == 'ArrowUp') {
      index = Math.max(0, index - 1);
    } else if (e.key == 'ArrowRight' || e.key == 'ArrowDown') {
      index = Math.min(visibleEls.length - 1, index + 1);
    }
    selectedEl.className =
        visibleEls.indexOf(selectedEl) < 0 ? '' : 'visible';
    visibleEls[index].className = 'visible selected';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Run through all plugins / examples.
  linkEls = document.querySelectorAll('main.index li a');
  textEls = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
  ulEls = document.querySelectorAll('ul');
  links = [];
  linkEls.forEach(function(link) {
    links.push({
      'text': link.textContent,
      'el': link,
    });
  });

  // Fuzzy search.
  fuse = new Fuse(links, {
    keys: ['text'],
  });

  var searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', searchBoxInputHandler);
  searchBox.addEventListener('keydown', searchBoxKeyDownHandler);
});
