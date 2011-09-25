/*
 * Copyright (C) 2006, José Coelho (jose.alberto.coelho@gmail.com)
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
 *
 */

var Web;
var scrollArea;
var scrollBar;

function LoadWidget() {
	Web = new URL();
	Widget.setSize();
	Widget.progressLoad("progressGraphic");
	scrollBar = new AppleVerticalScrollbar( document.getElementById('scrollBar') );
	scrollArea = new AppleScrollArea( document.getElementById('scrollArea') );
	scrollArea.addScrollbar( scrollBar );
	scrollBar.show();
	Widget.shrink();
	
}

function Search(value)
{
	/* needed because may exist links on contents */
	document.getElementById("SearchField").value = value;
	
	if( value.length == 0 )
	{
		/* nothing on search input, close widget */
		Widget.shrink();
		document.getElementById("contents").innerHTML = "";
		
	}
	else
	{
		/* visual output */
		Widget.progressStart();
		Web.location = "http://www.priberam.pt/dlpo/default.aspx?pal="+value;
		Web.fetchAsync( GetResult );
	}
}

function GetResult(webfetch)
{
    document.getElementById("contents").innerHTML = webfetch.result;
    var htmlDef=document.getElementById("DivDefinicao");
    document.getElementById("contents").innerHTML = "";
    var def=getDefinition(htmlDef);
	if(def)
	{
		document.getElementById("contents").innerHTML = def;
	}
	else
	{
		document.getElementById("contents").innerHTML = getSuggestions(htmlDef);
	}
	
	if( Widget.needResize() )
	{
		Widget.expand();
	}
	
	/* all done, stop progress and refresh scrollbar in order to match the contents */
	Widget.progressStop();
	scrollArea.refresh();
}

function Conjugation(value)
{
	/* needed because may exist links on contents */
	document.getElementById("SearchField").value = value;
	
	if( value.length == 0 )
	{
		/* nothing on search input, close widget */
		Widget.shrink();
		document.getElementById("contents").innerHTML = "";
		
	}
	else
	{
		/* visual output */
		Widget.progressStart();
		Web.location = "http://www.priberam.pt/dlpo/Conjugar.aspx?pal="+value;
		Web.fetchAsync( GetConjugation );
	}
}

function GetConjugation(webfetch)
{
  document.getElementById("contents").innerHTML = getConjugation(webfetch.result);
  	
  if( Widget.needResize() )
  {
	Widget.expand();
  }
	
  /* all done, stop progress and refresh scrollbar in order to match the contents */
  Widget.progressStop();
  scrollArea.refresh();
}

function openWebsite()  {
    widget.openURL('http://rcgoncalves.net/project/dicionariopt/');
}

/*
 * Remove html tags or make them a "clean" version
 * first argument - the string to clean
 * second argument - bool - dummy tag or remove
 * other arguments - html tags to clean/remove
 */
function stripTags()
{
	var string = arguments[0];
	var strip = arguments[1];
	for(var i = 2; i < arguments.length; i++)
	{
		var regex = new RegExp("<"+arguments[i]+"[^>]*>","img");
		string = string.replace(regex, strip ? "" : "<"+arguments[i]+">");
	}
	return string;
}
