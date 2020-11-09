document.addEventListener('DOMContentLoaded', function() {
  // Run through all plugins / examples.
  var textEls = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
  var ulEls = document.querySelectorAll('ul');
  var linkEls = document.querySelectorAll('main.index li a');
  var links = [];
  linkEls.forEach(function (link) {
    links.push({
      'text': link.textContent,
      'el': link,
    });
  });

  // Fuzzy search.
  var fuse = new Fuse(links, {
    keys: ['text']
  });

  var searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', function(e) {
    var selectedEl = document.querySelector('main.index li a.selected');

    var value = e.target.value;
    if (!value) {
      // Show all.
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
    } else {
      textEls.forEach(function(text) {
        text.style.display = 'none';
      });
      ulEls.forEach(function(ul) {
        ul.className = 'fluid';
      });
    }

    var search = fuse.search(value);
    var searchEls = search.map(function (e) {
      return e.item.el;
    });
    var visibleLinks = [];
    linkEls.forEach(function(link) {
      const shouldHide = searchEls.indexOf(link) < 0;
      link.style.display = shouldHide ? 'none' : '';
      link.parentElement.style.display = shouldHide ? 'none' : '';
      if (shouldHide) {
        link.className = '';
      } else {
        link.className = 'visible' + (selectedEl == link ? ' selected' : '');
        visibleLinks.push(link);
      }
    });

    // Go through the visible links, and if selectedEl is not one of them,
    // replace it.
    if (visibleLinks.length && visibleLinks.indexOf(selectedEl) < 0) {
      if (selectedEl) selectedEl.className = '';
      visibleLinks[0].className = 'visible selected';
    }
  });

  searchBox.addEventListener('keydown', function(e) {
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
  });
});
