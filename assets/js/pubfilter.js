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
 * @param {string} formId The id of the filtering form
 * @param {string} containerId The id of the container with all publications
 * @returns null
 */
 function PubFilter(formId, containerId) {
  if (!(this instanceof PubFilter)) {
    return new PubFilter(formId, containerId);
  }

  // Register key elements
  this.form = $('#' + formId).addClass('pf-form');
  this.container = $('#'+ containerId).addClass('pf-container');
  this.resetBtn = $.merge(this.form.find('.pf-reset'), this.container.find('.pf-reset'))
  this.selectors = this.form.find('select')
  this.search = this.form.find('input.search')

  this.publications = this.container.find('.bibbase_paper')
  this.publicationGroups = this.container.find('.bibbase_group_whole')
  this.noMatches = this.container.find('.pf-no-matches').addClass('pf-hidden');

  // Update the form whenever a selection is changed
  this.selectors.change(this.update.bind(this));

  // Whenever text is entered in the search box, update pubList
  this.search.keyup(this.update.bind(this))
  
  // Whenever the reset button is clicked, 
  // reset the selection elements and update pubList
  this.resetBtn.click(this.reset.bind(this));

  this.showCounts();
  this.update();
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
  // add keywords in the search field
  var keywords = [this.search.val()];

  // add keywords from the selection elements
  this.selectors.each(function(index, selector) {   
    value = $(selector).val()
    parts = value.split(/\s*\/\s*/)
    parts.forEach(function(part) {
      keywords.push(part)
    })
  });

  return this.cleanKeywords(keywords)
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
PubFilter.prototype.filterPublications = function(keywords) {
  // No keywords: all publications match
  if(keywords.length === 0) return this.publications;
  
  // Otherwise filter the publications
  var matches = this.publications.filter(function(index, pub) {
    var text = $(pub).text().toLowerCase();
    for(var i=0; i <= keywords.length; i++) {
      if(text.includes(keywords[i])) return true;
    }
    return false;
  });

  return matches;
}

/**
 * Update the publications shown based on selected options in the form
 */
PubFilter.prototype.update = function() {
  var keywords = this.collectKeywords();
  var matches = this.filterPublications(keywords);
  console.log('Keywords:', keywords)

  // First hide all publications
  this.publications.each(function(index, pub) { 
    $(pub).removeClass('pf-visible').addClass("pf-hidden");
  });

  // Then make the matches visible
  matches.each(function(index, pub){
    $(pub).removeClass('pf-hidden').addClass("pf-visible");
  })

  // Only show publication groups that contain visible publications
  this.publicationGroups.each(function(index, group) {
    var pubs = $(group).find('.bibbase_paper.pf-visible')
    if(pubs.length > 0) {
      $(group).removeClass('pf-hidden')
    } else {
      $(group).addClass('pf-hidden')
    }
  })

  // Show message when there are no matches
  this.noMatches.toggleClass('pf-hidden', matches.length > 0)
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
    var options = $(selector).find('option')
    options.each(function(index, option) {
      var keywords = this.cleanKeywords(option.value.split(/\s*\/\s*/))
      var matches = this.filterPublications(keywords)
      var count = matches.length
      if (option.value != "") {
        option.innerHTML = option.innerHTML + ' (' + count + ')';
      }
    }.bind(this))
  }.bind(this))
}