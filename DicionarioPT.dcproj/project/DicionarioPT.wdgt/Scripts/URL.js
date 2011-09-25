/*
 * Copyright (C) 2006, José Coelho (jose.alberto.coelho@gmail.com)
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

function URL() {
	this.xmlhttp = new XMLHttpRequest();
	
	// Atributes
	this.location = null;
	this.autoRedirect = true;
	this.outputFile = null;
	this.postData = null;
	this.response = null;
	this.responseData = null;
	this.result = null;
	this.headers = new Object;
	
	_self = this;
	
	// Main Function
	this._getURL = function(url,func,async) {
		var tmpHeaders;
		
		if( url ) {
			_self.location = url;
		}
		
		_self.xmlhttp.open( (_self.postData) ? "POST" : "GET" , _self.location, async);

		_self.xmlhttp.onreadystatechange=function() {
			
			if (_self.xmlhttp.readyState == 4) {
				
				_self.result = _self.xmlhttp.responseText;
				_self.response = _self.xmlhttp.status;
				_self.responseData = _self.xmlhttp.statusText;
				
				tmpHeaders = _self.xmlhttp.getAllResponseHeaders().split("\n");
				for(i = 0; i< tmpHeaders.length; i++) {
					var tmp = tmpHeaders[i].split(":");
					_self.headers[ tmp[0] ] = tmp[1];
				}
				
				if (func) {
					return func(_self)
				} else return _self.result
			}
		}
		
		_self.xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		_self.xmlhttp.send( _self.postData );
	}
}

URL.prototype.fetch = function(url) {
	return this._getURL(url,null,false);
}

URL.prototype.fetchAsync = function(func) {
	return this._getURL(null, func, true);
}

URL.prototype.getResponseHeaders = function(name){
	if(name == "*") {
		return _self.headers;
	}
	else return _self.headers[ name ];
}

URL.prototype.setRequestHeader = function(name, value) {
	_self.xmlhttp.setRequestHeader(name, value);
}

URL.prototype.cancel = function()
{
	_self.xmlhttp.abort();
}

URL.prototype.clear = function()
{
	this.xmlhttp = new XMLHttpRequest();
	this.location = null;
	this.autoRedirect = null;
	this.outputFile = null;
	this.postData = null;
	this.response = null;
	this.responseData = null;
	this.result = null;
	this.headers = new Object;
}
