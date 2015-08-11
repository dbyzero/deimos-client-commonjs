var EventEmitter = require('events').EventEmitter;
var inherit = require('../tools/inherit');

Speaker = function (avatar, readonly) {
	this.id = 'speaker_' + avatar.id + '_' + Math.floor((Math.random()*1000000)+1);
	this.readonly = readonly;
}

inherit(Speaker,EventEmitter);

Speaker.prototype.init = function(avatar) {
	//make dom element
	this.domElem = document.createElement("div");
	this.domElem.setAttribute("class","speaker") ;
	this.domElem.setAttribute("id",this.id) ;
	this.domElem.style.display = 'none' ;

	if(this.readonly) {
		this.domElem.style.backgroundPosition = '0px -100px' ;
	}

	this.domElemTextArea = document.createElement("textarea") ;
	if(this.readonly) {
		this.domElemTextArea.readOnly = true; 
	}

	this.domElem.appendChild(this.domElemTextArea) ;
	avatar.domElem.appendChild(this.domElem) ;

	this.domElemTextArea.addEventListener('input', function(e){
		this.emit('textChange', this.domElemTextArea.value)
	}.bind(this));
},

Speaker.prototype.getText = function() {
	return this.domElemTextArea.value ;
},

Speaker.prototype.setText = function(txt) {
	this.domElemTextArea.value = txt;
},

Speaker.prototype.show = function() {
	this.domElem.style.display = 'block';
	if(this.readonly !== true)
	{
		this.domElemTextArea.focus() ;
	}
},

Speaker.prototype.hide = function() {
	this.domElem.style.display = 'none';
	this.domElemTextArea.value = '';
	if(this.readonly !== true)
	{
		this.leaveFocus();
	}
},

Speaker.prototype.leaveFocus = function() {
	this.domElemTextArea.blur() ;
}

module.exports = Speaker;