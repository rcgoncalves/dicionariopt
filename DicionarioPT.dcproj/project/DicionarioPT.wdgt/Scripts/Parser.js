/*
 * Copyright (C) 2009, Rui Carlos Gonçalves (rcgoncalves.pt@gmail.com)
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

/**
 * Get word definition
 */
function getDefinition(html)
{
  if(html==null) return null;
  else if(html.innerHTML.match("FormataSugestoesENaoEncontrados")) return null;
  else {
    parseDefinitionStructure(html);
    definition = html.innerHTML;
    definition=stripTags(definition,true,"font","img","Definicao","/Definicao");
    return definition;
  }
}

/**
 * Get suggestions
 */
function getSuggestions(htmlDef)
{
  var result = "";
  for(i = 0; i < htmlDef.children.length; i++) {
    var div = htmlDef.children[i];
    var id = div.getAttribute("id");
    if(div.tagName == "DIV" && id != null && id == "FormataSugestoesENaoEncontrados") {
      if(div.children[0].tagName == "FONT") {
        if(div.children[0].children[0] != null && div.children[0].children[0].tagName == "A") {
          var word = div.children[0].children[0].innerHTML;
          word = word.replace(/^\s/,"");
          word = word.replace(/\s$/,"");
          result += "<li><a href=\"javascript:Search('" + word + "')\">" + word + "</a></li>\n";
        }
        else {
          var word = div.children[0].innerHTML;
          word = word.replace(/^\s/,"");
          word = word.replace(/\s$/,"");
          result += "<li>" + word + "</li>\n";
        }
      }
      else {
	    var wordlinked=html.stripTags(div.innerHTML, true, "font", "/font");
	    var word=stripTags(wordlinked, true, "a", "/a");
        result += "<li>";
        result += wordlinked.replace(/<a[^>]*>/,"<a href=\"javascript:Search('"+word+"')\">");
        result += "</a>";
        result += "</li>\n";
      }
    }
  }
  if(result != "") {
    result = "Existem as seguintes sugest&otilde;es:\n" + "<ul style=\"margin: 3px; padding-left: 18px; text-indent: -3px;\">\n" + result + "</ul>\n";
    return result;
  }
  else return "N&atilde;o existem sugest&otilde;es.";
}

/**
 * Get verb conjugation
 */
function getConjugation(html)
{
  var str=getFirstElementByTagName(html,"body");
  str=getFirstElementByTagName(str,"body",10);
  
  str=stripTags(str, true, "body", "font", "/body");
  str=str.replace(/background-color:\s*#eee;/g,"");
  str=str.replace(/(<br>)*$/g,"");
  
  return str;
}

/**
 * Returns the first element from XML formatted string 'str', with tag name 'tag'.
 * It starts searching from 'start'.
 */
function getFirstElementByTagName(str, tag, start)
{
  var strx=str;
  if(start) strx=strx.substr(start);
  strx=removeComments(strx);
  var res="";
  var open=new RegExp("<"+tag+"[^>]*>","i");
  var close=new RegExp("</"+tag+" *>","i");
  var pos1=strx.search(open);
  var pos2;
  var pos=pos1;
  var count;
  
  if(pos<0) return "";
  else
  {
    strx=strx.substr(pos);
    res=strx.substr(0,1);
    strx=strx.substr(1);
    count=1;
    var error=false;
    
    while(count>0 && !error)
    {
      pos1=strx.search(open);
      pos2=strx.search(close);
      if(pos2<0) error=true;
      
      if(pos1<pos2 && pos1>=0) //open tag
      {
        count++;
        pos=pos1;
      }
      else if(pos2>=0) //close tag
      {
        count--;
        pos=pos2;
      }
      
      res+=strx.substr(0,pos+1);
      strx=strx.substr(pos+1);
    }
    
    if(error) return "";
    else return res+"/"+tag+">";
  }
}

/**
 * Remove XML comments from the string 'str'.
 */
function removeComments(str)
{
  var start=str.indexOf("<!--");
  var end;
  while(start>=0)
  {
    end=str.indexOf("-->");
    if(end<=start) start=-1;
    else
    {
      str=str.substr(0,start)+str.substr(end+3);
      start=str.indexOf("<!--");
    }
  }
  
  return str;
}

function removeSpaces(str)
{
  var res=str.replace(/\s+/g,"");
  return res;
}

function removeTags(str)
{
  var res=str.replace(/<[^>]*>/g,"");
  return res;
}

/**
 * Remove the attributes of a HTMElement.
 */
function removeAttributes(element) {
  while(element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }
}

/**
 * Parse definition.
 * Adjust URL, remove some attributes, remove some tags, etc.
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
          url=url.replace(/(.|\n)*Conjugar.aspx\?pal=([^\"]+)/ig,"javascript:Conjugation('$2')");
          url=url.replace(/(.|\n)*default.aspx\?pal=([^\"]+)/ig,"javascript:Search('$2')");
          elem.setAttribute("href", url);
          elem.innerHTML=elem.innerHTML.replace(/^\s*/,"");
          elem.innerHTML=elem.innerHTML.replace(/\s*$/,"");
        }
        break;
      case "DIV" :
        var style=elem.getAttribute("style");
        if(style != null) {
          if(style.match(/background-color:\s*#f1f1f1;/ig)) toDel = 1;
          else {
            style=style.replace(/background-color:\s*#eee;/,"");
            elem.setAttribute("style", style);
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
}