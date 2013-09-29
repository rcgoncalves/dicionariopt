/*
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
 */

// ======================================================================================================
// INITIAL PARSING ======================================================================================
// ======================================================================================================

/**
 * Finds the block that contains the relevant content.
 */
function getMainContent() {
  var divs = document.getElementsByTagName('div');
  var div = null;
  var i = divs.length - 1;
  var stop = false;
  while(i >= 0 && !stop) {
    div = divs[i];
    if(div.className != null && div.className.indexOf('pb-main-content') > -1) {
      stop = true;
    }
    i--;
  }
  return div;
}

// ======================================================================================================
// WORD DEFINITION ======================================================================================
// ======================================================================================================

/**
 * Returns a word definition.
 */
function getDefinition(html)
{
  var definition = null;
  if(html != null) {
    if(html.innerHTML.indexOf('alert-info') < 0 ||
        (html.innerHTML.indexOf('Palavra não encontrada') < 0
	&& html.innerHTML.indexOf('Palavra reconhecida pelo FLiP mas sem definição no dicionário') < 0)
	) {
      html = html.getElementsByTagName('div')[0];
      html = parseDefinitionStructure(html);
      if(html != null) {
        definition = html.innerHTML;
	definition = stripTags(definition, true,
	    'font',
	    'img',
	    'notas', '/notas',
	    'categoria_ext_aao', '/categoria_ext_aao',
	    'pt', '/pt',
	    'aao', '/aao',
	    'dominio_ext_aao', '/dominio_ext_aao');
      }
    }
  }
  return definition;
}

/**
 * Parses a word definition.
 * Adjust URLs, removes some attributes, remove some tags, etc.
 */
function parseDefinitionStructure(html) {
  for(var i = html.children.length ; i > 0; i--) {
    var elem = html.children[i-1];
    var toDel = 0;
    switch(elem.tagName) {
      case 'A' :
        var url=elem.getAttribute('href');
        if(url!=null) {
          if(!url.match(/\/dlpo\//ig)) {
            elem.removeAttribute('href');
          }
          else {
            url=url.replace(/(.|\n)*\/dlpo\/Conjuga\/(.+)/ig, "javascript:Conjugation('$2')");
	    url=url.replace(/(.|\n)*\/dlpo\/(.+)/ig, "javascript:Search('$2')");
            elem.setAttribute('href', url);
          }
        }
        break;
      case 'REFS_EXTERNAS' :
      case 'SCRIPT' :
        toDel = 1;
        break;
      case 'DIV' :
        var style = elem.style;
	if(style.display == 'none') toDel = 1;
        break;
      case 'TD' :
      case 'TABLE' :
        removeAttributes(elem);
        break;
      case 'SPAN' :
        if(elem.className == 'varpb') toDel = 1;
        break;
      case 'BR' :
        toDel = 2;
	break;
      case 'CATEGORIA_EXT_AAO' :
        var newElem = document.createElement('SPAN');
	newElem.className = 'dpt-categoria';
	newElem.innerHTML = elem.innerHTML;
	elem.innerHTML = '';
	elem.appendChild(newElem);
        break;
    }
    if(toDel == 1) {
      html.removeChild(elem);
      if(i > 1 && html.children[i-2].tagName == 'BR') {
        html.removeChild(html.children[i-2]);
        i--;
      }
    }
    else if(toDel == 2 && i > 1 && html.children[i-2].tagName == 'BR') {
      html.removeChild(elem);
    }
    else if(elem.innerHTML.match(/^\s*$/) && toDel != 2) {
      html.removeChild(elem);
    }
    else {
      elem.removeAttribute('style');
      // recursive call
      parseDefinitionStructure(elem);
    }
  }
  return html;
}

// ======================================================================================================
// SUGGESTIONS ==========================================================================================
// ======================================================================================================

/**
 * Returns a feedback message for words that do not have a definition available.
 */
function getSuggestions(html) {
  var result = "";
  if(html.innerHTML.indexOf('Palavra reconhecida pelo FLiP mas sem definição no dicionário') > -1) {
    result = '<p>Palavra reconhecida mas sem definição no disponível.</p>';
  }
  else {
    var list = getSuggestionsList(html);
    for(i in list) {
      result += '<li><a href="javascript:Search(\'' + list[i] + '\')">' + list[i] + '</a></li>\n';
    }
    if(result != '') {
      result = '<p style="font-weight:bold;">Palavra não encontrada.</strong></p><p>Experimente uma das seguintes sugestões:</p>\n'
          + '<ul style="margin: 3px; padding-left: 18px; text-indent: -3px; list-style-type: square;">\n'
	  + result
	    + '</ul>\n';
    }
    else {
      result = '<p style="font-weight:bold;">Palavra não encontrada.</p><p>Não existem sugestões.</p>';
    }
  }
  return result;
}

/**
 * Returns list of suggestions.
 */
function getSuggestionsList(html) {
  var result = new Array();
  var divs = html.getElementsByTagName('div');
  for(var i = 0; i < divs.length; i++) {
    var div = divs[i];
    if(div.id == 'FormataSugestoesENaoEncontrados') {
      result.push(div.innerText);
    }
  }
  return result;
}

// ======================================================================================================
// CONJUGATION ==========================================================================================
// ======================================================================================================

/**
 * Returns a verb conjugation.
 */
function getConjugation(html) {
  var result = html.children[0];
  // remove meta tags
  var elems = result.getElementsByTagName('meta');
  for(var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    elem.parentNode.removeChild(elem);
  }
  // remove style tags
  elems = result.getElementsByTagName('style');
  for(var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    elem.parentNode.removeChild(elem);
  }
  // remove span tags
  elems = result.getElementsByTagName('span');
  for(var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if(elem.style.color == 'rgb(255, 255, 255)') {
      elem.parentNode.removeChild(elem);
    }
  }
  var regex = new RegExp('/ elas?/ vocês?', 'g');
  return result.innerHTML.replace(regex, '');
}

// ======================================================================================================
// AUXILIAR FUNCTIONS ===================================================================================
// ======================================================================================================

/**
 * Remove the attributes of a HTMLElement.
 */
function removeAttributes(element) {
  while(element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }
}