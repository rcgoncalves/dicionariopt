/*
 * Copyright (C) 2012, Rui Carlos Gonçalves (rcgoncalves.pt@gmail.com)
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
// WORD DEFINITION ======================================================================================
// ======================================================================================================

/**
 * Get word definition
 */
function getDefinition(html)
{
  if(html == null) return null;
  else if(html.innerHTML.match("FormataSugestoesENaoEncontrados")) return null;
  else {
    html = getDefinitionStructure(html);
    html = parseDefinitionStructure(html);
    definition = html.innerHTML;
    definition = stripTags(definition,true,"font","img","Definicao","/Definicao");
    return definition;
  }
}

/**
 * Finds the block that contains the definition.
 */
function getDefinitionStructure(html) {
  var i = html.children.length - 1;
  for( ; i >= 0; i--) {
    var elem = html.children[i];
    if(elem.tagName == 'DEF') {
      return elem;
    }
    else {
      rec = getDefinitionStructure(elem);
      if(rec) return rec;
    }
  }
  return null;
}

/**
 * Parse definition.
 * Adjust URLs, remove some attributes, remove some tags, etc.
 */
function parseDefinitionStructure(html) {
  var i = html.children.length;
  for( ; i > 0; i--) {
    var elem = html.children[i-1];
    var toDel = 0;
    switch(elem.tagName) {
      case "A" :
        var url=elem.getAttribute("href");
        if(url!=null) {
          if((!url.match(/(.|\n)*Conjugar.aspx\?pal=([^\"]+)/ig)) //"
              && (!url.match(/(.|\n)*default.aspx\?pal=([^\"]+)/ig)) //"
              && (!url.match(/dicionario@priberam.pt/))) {
            elem.removeAttribute("href");
          }
          else {
            url=url.replace(/(.|\n)*Conjugar.aspx\?pal=([^\"]+)/ig,"javascript:Conjugation('$2')"); //"
            url=url.replace(/(.|\n)*default.aspx\?pal=([^\"]+)/ig,"javascript:Search('$2')"); //"
            elem.setAttribute("href", url);
            elem.innerHTML=elem.innerHTML.replace(/^\s*/,"");
            elem.innerHTML=elem.innerHTML.replace(/\s*$/,"");
          }
        }
        break;
      case "REFS_EXTERNAS" :
      case "SCRIPT" :
        toDel = 1;
        break;
      case "DIV" :
        var divId=elem.getAttribute('id');
        if(divId=='ctl00_ContentPlaceHolder1_pnl_ultimas_pesquisas'
            || divId=='ctl00_ContentPlaceHolder1_pnl_nuvem_palavras'
            || divId=='ctl00_ContentPlaceHolder1_pnl_VerVideo'
            || divId=='ctl00_ContentPlaceHolder1_pnl_Traduzir'
            || divId=='ctl00_ContentPlaceHolder1_pnl_relacionadas') {
          toDel = 1;
        }
        else {
          var style=elem.getAttribute("style");
          if(style != null) {
            if(style.match(/background-color:\s*#f1f1f1;/ig)) toDel = 1;
            else {
              style=style.replace(/background-color:\s*#eee;/,"");
              elem.setAttribute("style", style);
            }
          }
        }
        break;
      case "TD" :
      case "TABLE" :
        removeAttributes(elem);
        break;
      case "SPAN" :
        if(elem.getAttribute("class") == "varpb") toDel = 1;
        else {
          elem.removeAttribute("ondblclick");
          elem.removeAttribute("title");
        }
        break;
      case "BR" :
        toDel = 2;
    }
    if(toDel == 1) {
      html.removeChild(elem);
      if(i > 1 && html.children[i-2].tagName == "BR") {
        html.removeChild(html.children[i-2]);
        i--;
      }
    }
    else if(toDel == 2 && i > 1 && html.children[i-2].tagName == "BR") {
      html.removeChild(elem);
    }
    else if(elem.innerHTML.match(/^\s*$/) && toDel != 2) {
      html.removeChild(elem);
    }
    else {
      var style=elem.getAttribute("style");
      if(style != null) {
        style=style.replace(/color:#999;/g,"color:#222;");
        elem.setAttribute("style", style);
      }
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
 * Get suggestions
 */
function getSuggestions(htmlDef) {
  var result = "";
  var list = getSuggestionsList(htmlDef);
  for(i in list) {
    result += "<li><a href=\"javascript:Search('" + list[i] + "')\">" + list[i] + "</a></li>\n";
  }
  if(result != "") {
    result = "Existem as seguintes sugest&otilde;es:\n" + "<ul style=\"margin: 3px; padding-left: 18px; text-indent: -3px; list-style-type: square;\">\n" + result + "</ul>\n";
    return result;
  }
  else return "N&atilde;o existem sugest&otilde;es.";
}

/**
 * Get list of suggestions.
 */
function getSuggestionsList(htmlDef) {
  var result = new Array();
  for(i = 0; i < htmlDef.children.length; i++) {
    var elem = htmlDef.children[i];
    var id = elem.getAttribute("id");
    if(elem.tagName == "DIV" && id != null && id == "FormataSugestoesENaoEncontrados") {
      result.push(elem.innerText);
    }
    else if(elem.innerHTML.match(/FormataSugestoesENaoEncontrados/)) {
      result = result.concat(getSuggestionsList(elem));
    }
  }
  return result;
}

// ======================================================================================================
// CONJUGATION ==========================================================================================
// ======================================================================================================

/**
 * Get verb conjugation
 */
function getConjugation(html) {
  var str = getFirstElementByTagName(html,"body");
  str = getFirstElementByTagName(str,"body",10);
  
  str = stripTags(str, true, "body", "font", "/body");
  str = str.replace(/background-color:\s*#eee;/g,"");
  str = str.replace(/(<br>)*$/g,"");
  
  return str;
}

// ======================================================================================================
// AUXILIAR FUNCTIONS ===================================================================================
// ======================================================================================================

/**
 * Returns the first element from XML formatted string 'str', with tag name 'tag'.
 * It starts searching from 'start'.
 */
function getFirstElementByTagName(str, tag, start) {
  var strx = str;
  if(start) strx = strx.substr(start);
  strx = removeComments(strx);
  var res = "";
  var open = new RegExp("<"+tag+"[^>]*>","i");
  var close = new RegExp("</"+tag+" *>","i");
  var pos1 = strx.search(open);
  var pos2;
  var pos = pos1;
  var count;
  
  if(pos < 0) return "";
  else {
    strx = strx.substr(pos);
    res = strx.substr(0,1);
    strx = strx.substr(1);
    count = 1;
    var error = false;
    
    while(count > 0 && !error) {
      pos1 = strx.search(open);
      pos2 = strx.search(close);
      if(pos2 < 0) error = true;
      
      if(pos1 < pos2 && pos1 >= 0) { //open tag
        count++;
        pos = pos1;
      }
      else if(pos2 >= 0) { //close tag
        count--;
        pos = pos2;
      }
      
      res += strx.substr(0,pos + 1);
      strx = strx.substr(pos + 1);
    }
    
    if(error) return "";
    else return res + "/" + tag + ">";
  }
}

/**
 * Remove XML comments from string 'str'.
 */
function removeComments(str) {
  return str.replace(/<!--[\s\S]*?-->/g);
}

/**
 * Remove consecutive spaces from string 'str'.
 */
function removeSpaces(str) {
  var res=str.replace(/\s+/g,"");
  return res;
}

/**
 * Removes all tags from string 'str'.
 */
function removeTags(str) {
  var res=str.replace(/<[^>]*>/g,"");
  return res;
}

/**
 * Remove the attributes of a HTMLElement.
 */
function removeAttributes(element) {
  while(element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }
}