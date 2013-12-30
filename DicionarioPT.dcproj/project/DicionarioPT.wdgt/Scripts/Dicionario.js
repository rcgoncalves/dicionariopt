/*
 * Copyright (C) 2006, José Coelho (jose.alberto.coelho@gmail.com)
 * Copyright (C) 2013, Rui Carlos Gonçalves (rcgoncalves.pt@gmail.com)
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software Foundation; either version 2 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 *
 */

var Web;
var scrollArea;
var scrollBar;

function LoadWidget() {
  Web = new URL();
  Widget.setSize();
  Widget.progressLoad("progressGraphic");
  scrollBar = new AppleVerticalScrollbar(document.getElementById('scrollBar'));
  scrollArea = new AppleScrollArea(document.getElementById('scrollArea'), scrollBar);
  scrollArea.addScrollbar(scrollBar);
  scrollBar.show();
  Widget.shrink();
}

function shrinkExpand(event) {
  if(Widget.close) {
    Widget.expand();
  }
  else {
    Widget.shrink();
  }
}

/**
 * Searches for a word definition.
 */
function Search(value) {
  document.getElementById("SearchField").value = value;
  if(value.length == 0) {
    Widget.shrink();
    document.getElementById("contents").innerHTML = '';
  }
  else {
    Widget.progressStart();
    Web.location = "http://www.priberam.pt/dlpo/" + value;
    Web.fetchAsync(GetDefinition);
  }
}

/**
 * Callback function that processes a word definition.
 */
function GetDefinition(webfetch) {
  document.getElementById('contents').innerHTML = webfetch.result;
  var content = getMainContent();
  document.getElementById('contents').innerHTML = '';
  var def = getDefinition(content);
  if(def) {
    document.getElementById('contents').innerHTML = def;
  }
  else {
    document.getElementById('contents').innerHTML = getSuggestions(content);
  }
  if(Widget.needResize()) {
    Widget.expand();
  }
  Widget.progressStop();
  scrollArea.refresh();
  scrollBar.refresh();
  scrollArea.verticalScrollTo(0);
}

/**
 * Obtains a verb conjugation.
 */
function Conjugation(value) {
  document.getElementById('SearchField').value = value;
  if( value.length == 0 ) {
    Widget.shrink();
    document.getElementById('contents').innerHTML = '';
  }
  else {
    Widget.progressStart();
    Web.location = 'http://www.priberam.pt/dlpo/Conjugar/' + value;
    Web.fetchAsync( GetConjugation );
  }
}

/**
 * Callback function that processes a verb conjugation.
 */
function GetConjugation(webfetch) {

  document.getElementById('contents').innerHTML = webfetch.result;
  var content = getMainContent(webfetch.result);
  document.getElementById('contents').innerHTML = '';
  document.getElementById('contents').innerHTML = getConjugation(content);
  if(Widget.needResize()) {
    Widget.expand();
  }
  Widget.progressStop();
  scrollArea.refresh();
  scrollBar.refresh();
  scrollArea.verticalScrollTo(0);
}

/**
 * Opens widget website.
 */
function openWebsite()  {
  widget.openURL('http://rcgoncalves.pt/project/dicionariopt/');
}

/*
 * Removes html tags or make them a "clean" version
 * first argument - the string to clean
 * second argument - bool - dummy tag or remove
 * other arguments - html tags to clean/remove
 */
function stripTags() {
  var string = arguments[0];
  var strip = arguments[1];
  for(var i = 2; i < arguments.length; i++)
  {
    var regex = new RegExp('<' + arguments[i] + '[^>]*>', 'img');
    string = string.replace(regex, strip ? '' : '<' + arguments[i] + '>');
  }
  return string;
}