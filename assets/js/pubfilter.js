/**
 * PubFilter
 * 
 * Author: Bas Cornelissen, based on a script by Floris Roelofsen
 * Copyright: Bas Cornelissen
 * Date: 7 august 2021
 * Version 0.1
 */

/**
 * This class allows you to filter a list of BibBase publications 
 * using a form with a search option and several selectors.
 * 
 * Replacements
 * ------------
 * 
 * BibBase generates references that often contain things like 
 * "Author 1, & Author 2" where you want  "Author 1 & Author 2". 
 * To fix this, PubFilter iterates over the leafs of every 
 * publication to replace all such patterns. You can specify
 * more patterns by passing the option `replacements`:
 * 
 *  PubFilter('myFormId', 'myContainerId', {
 *    replacements: {
 *      'myRegexPattern': 'replacement'
 *    }
 *  })
 * 
 * @param {string} formId The id of the filtering form
 * @param {string} containerId The id of the container with all publications
 * @returns null
 */
 function PubFilter(formId, containerId, options) {
  if (!(this instanceof PubFilter)) {
    return new PubFilter(formId, containerId, options);
  }

  // Options
  var defaultOptions = {
    // Selectors
    searchSelector: 'input.search',
    pubGroupSelector: '.bibbase_group_whole',
    pubSelector: '.bibbase_paper',
    
    // Core replacements; please override using the replacements option
    _coreReplacements: {
      ',\\s+&': ' &',
      '.,\\s+editor(s)': ', editor(s)'
    },
    
    // Use this to pass (additional) replacements (same format as above)
    replacements: {},

    // Leafs of the publications to which the replacements are applied
    replacementSelector: '.bibbase_paper_author, .bibbase_paper_title a, i'
  };
  this.opts = Object.assign({}, defaultOptions, options);
  this.opts.replacements = Object.assign({}, this.opts._coreReplacements, this.opts.replacements);

  // Register key elements
  this.form = $('#' + formId).addClass('pf-form');
  this.container = $('#'+ containerId).addClass('pf-container');
  this.resetBtn = $.merge(this.form.find('.pf-reset'), this.container.find('.pf-reset'));
  this.selectors = this.form.find('select');
  this.search = this.form.find(this.opts.searchSelector);

  this.publications = this.container.find(this.opts.pubSelector);
  this.publicationGroups = this.container.find(this.opts.pubGroupSelector);
  this.noMatches = this.container.find('.pf-no-matches').addClass('pf-hidden');

  // Update the form whenever a selection is changed
  this.selectors.change(this.update.bind(this));

  // Whenever text is entered in the search box, update pubList
  this.search.keyup(this.update.bind(this));
  
  // Whenever the reset button is clicked, 
  // reset the selection elements and update pubList
  this.resetBtn.click(this.reset.bind(this));

  this.applyReplacements();
  this.showCounts();
  this.update();
}

/**
 * Applies all replacements specified in the options. The function
 * iterates over all the leafs of every publication and applies the
 * replacement to the text of every leaf.
 */
PubFilter.prototype.applyReplacements = function() {
  var elements = this.publications.find(this.opts.replacementSelector);
  elements.each(function(index, el) {
    var text = $(el).text();
    $.each(this.opts.replacements, function(key, value) {
      var expr = RegExp(key, 'g');
      text = text.replace(expr, value);
    })
    $(el).text(text);
  }.bind(this));
}

/**
 * Clean up an array of keywords
 * @param {Array} keywords An array of keywords
 * @returns trimmed, lowercase keywords
 */
PubFilter.prototype.cleanKeywords = function(keywords) {
  return keywords
    .filter(function(keyword){ return keyword !== '' })
    .map(function(keyword) {
      return keyword.trim().toLowerCase()
    });
}

/**
 * Collects all keywords currently entered or selected in the form
 * 
 * @returns Array of keywords
 */
PubFilter.prototype.collectKeywords = function() {
  // Array of keyword groups: arrays of keywords
  var keywordGroups = []

  // add keywords in the search field
  var query = this.search.val()
  if(query !== '') {
    keywordGroups.push(this.cleanKeywords([query]))
  }

  // add keywords from the selection elements
  this.selectors.each(function(index, selector) {   
    value = $(selector).val();
    if(value === null) return;
    var parts = value.split(/\s*\/\s*/);
    keywords = this.cleanKeywords(parts);
    keywordGroups.push(keywords);
  }.bind(this));

  return keywordGroups;
}

/**
 * Find all publications that match an array of keywords. A publication
 * matches an array of keywords if any of the keywords occurs anywhere in
 * the full HTML corresponding of that publication. The full HTML includes
 * a BibTeX entry, an abstract, etc.
 * 
 * @param {Array} keywords An array of keywords
 * @returns An array of publication elements matching the keywords
 */
PubFilter.prototype.filterPublications = function(keywordGroups) {
  // No keywords: all publications match
  if(
    (keywordGroups.length === 0)
    || ((keywordGroups.length === 1) && (keywordGroups[0].length === 0))
  ){
    return this.publications;
  } 
  
  // Otherwise filter the publications
  var matches = this.publications.filter(function(index, pub) {
    var text = $(pub).text().toLowerCase();
    var isMatch = true;
    for(var i=0; i < keywordGroups.length; i++) {
      var keywords = keywordGroups[i];

      // Disjunction: match any of the keywords in this group
      var matchesGroup = false;
      for(var j=0; j <= keywords.length; j++) {
        if(text.includes(keywords[j])) {
          var matchesGroup = true;
        }
      }

      // Conjunction
      isMatch = isMatch && matchesGroup
      if(isMatch == false) return false;
    } 
   
    return true;
  });

  return matches;
}

/**
 * Update the publications shown based on selected options in the form
 */
PubFilter.prototype.update = function() {
  var keywordGroups = this.collectKeywords();
  var matches = this.filterPublications(keywordGroups);
  console.log('Keyword groups:', keywordGroups);

  // First hide all publications
  this.publications.each(function(index, pub) { 
    $(pub).removeClass('pf-visible').addClass("pf-hidden");
  });

  // Then make the matches visible
  matches.each(function(index, pub){
    $(pub).removeClass('pf-hidden').addClass("pf-visible");
  });

  // Only show publication groups that contain visible publications
  this.publicationGroups.each(function(index, group) {
    var pubs = $(group).find('.bibbase_paper.pf-visible');
    if(pubs.length > 0) {
      $(group).removeClass('pf-hidden');
    } else {
      $(group).addClass('pf-hidden');
    }
  });

  // Show message when there are no matches
  this.noMatches.toggleClass('pf-hidden', matches.length > 0);
}

/**
 * Reset the form and publications
 */
 PubFilter.prototype.reset = function() {
  this.form[0].reset();
  this.update();
}

/**
 * Show the number of matches for every option
 */
PubFilter.prototype.showCounts = function() { 
  this.selectors.each(function(index, selector) {
    var options = $(selector).find('option');
    options.each(function(index, option) {
      var keywordGroups = [this.cleanKeywords(option.value.split(/\s*\/\s*/))];
      var matches = this.filterPublications(keywordGroups);
      var count = matches.length;
      if (option.value != "") {
        option.innerHTML = option.innerHTML + ' (' + count + ')';
      }
    }.bind(this));
  }.bind(this));
}