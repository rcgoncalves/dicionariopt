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


var Widget = new Object();

//The closed size for the widget
Widget.CLOSED_SIZE = { x: 450, y: 75 };

//The minimum size for the widget (when open)
Widget.MINIMUM_SIZE = { x: 450, y: 250 };

//The last user resize for the widget
Widget.LAST_SIZE = { x: Widget.MINIMUM_SIZE.x, y: Widget.MINIMUM_SIZE.y }

Widget.close = false;

Widget.setSize = function() {
	document.getElementById("front").style.width = Widget.CLOSED_SIZE.x + 'px';
	document.getElementById("front").style.height = Widget.CLOSED_SIZE.y + 'px';
}

Widget.shrink = function() {
	Widget.close = true;
	document.getElementById("bottomBar").style.display = "none";
	
	Widget.LAST_SIZE.x = parseInt(document.getElementById("front").style.width);
	Widget.LAST_SIZE.y = parseInt(document.getElementById("front").style.height);
	
	Widget.resize( parseInt(document.getElementById("front").style.width), Widget.CLOSED_SIZE.y );

}

Widget.expand = function() {
	Widget.close = false;
	document.getElementById("bottomBar").style.display = "block";
	
	if( Widget.LAST_SIZE.y > Widget.MINIMUM_SIZE.y && Widget.LAST_SIZE.x > Widget.MINIMUM_SIZE.x )
		Widget.resize( Widget.LAST_SIZE.x , Widget.LAST_SIZE.y );
	else
		Widget.resize( Widget.MINIMUM_SIZE.x , Widget.MINIMUM_SIZE.y );
}

Widget.needResize = function() {
	return Widget.close;
}

Widget.eventInset = null;
Widget.resizeMouseDown = function(event) {
	document.addEventListener("mousemove", Widget.resizeMouseMove, true);
	document.addEventListener("mouseup", Widget.resizeMouseUp, true);
	
	Widget.eventInset = {x:(window.innerWidth - event.x), y:(window.innerHeight - event.y)};

	event.stopPropagation();
	event.preventDefault();
}

Widget.resizeMouseMove = function(event) {
	var x = event.x + Widget.eventInset.x;
	var y = event.y + Widget.eventInset.y;
	
	if (x < Widget.MINIMUM_SIZE.x) {
		x = Widget.MINIMUM_SIZE.x;
	}

	if (y < Widget.MINIMUM_SIZE.y) {
		y = Widget.MINIMUM_SIZE.y;
	}

	Widget.resize(x,y);
	
	scrollArea.refresh();
	event.stopPropagation();
	event.preventDefault();
}

Widget.resizeMouseUp = function(event) {	
	document.removeEventListener("mousemove", Widget.resizeMouseMove, true);
	document.removeEventListener("mouseup", Widget.resizeMouseUp, true);

	event.stopPropagation();
	event.preventDefault();
}

// Resize the widget.
Widget.resize = function(x, y) {
	document.getElementById("front").style.height = y + 'px';
	document.getElementById("front").style.width = x + 'px';
	window.resizeTo(x, y);
}

var progress = null;
Widget.progressLoad = function(element) {
	progress = new ProgressIndicator(element);
}

Widget.progressStart = function() {
	progress.start();
}

Widget.progressStop = function() {
	progress.stop();
}

function ProgressIndicator(element) {
    this.count = 0;
    this.timer = null;
    this.element = document.getElementById(element);
    this.element.style.display = "none";
    this.imageBaseURL = "Images/Progress/prog";
}

ProgressIndicator.prototype = {
    start : function () {
        this.element.style.display = "block";        
        if (this.timer) clearInterval(this.timer);
        this.tick();
        var localThis = this;
        this.timer = setInterval (function() { localThis.tick() }, 60);
    },

    stop : function () {
        clearInterval(this.timer);
        this.element.style.display = "none";
    },

    tick : function () {
        var imageURL = this.imageBaseURL + (this.count + 1) + ".png";
        this.element.src = imageURL;
        this.count = (this.count + 1) % 12;
    }
}

