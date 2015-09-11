var Vector = require('../tools/Vector');

var AttackZone = function(id,position,size,ownerId,duration) {
	this.id			= id;
	this.domId		= 'attackzone-'+id;
	this.position	= position;
	this.size		= size;
	this.ownerId	= ownerId;
	this.duration	= duration;
	this.vertexTL = new Vector(position.x,				position.y);
	this.vertexTR = new Vector(position.x + size.x,		position.y);
	this.vertexBL = new Vector(position.x,				position.y + size.y);
	this.vertexBR = new Vector(position.x + size.x,		position.y + size.y);
	this.lastUpdate = new Date().getTime();
}

AttackZone.prototype.render = function() {
	this.domElem = document.createElement("div");
	this.domElem.setAttribute("id",this.domId);

	this.domElem.style.width = parseInt(this.size.x)+'px';
	this.domElem.style.height  = parseInt(this.size.y)+'px';

	this.domElem.style.display  = 'block';
	this.domElem.style.position  = 'absolute';

	this.domElem.style.backgroundColor  = '#333';
	this.domElem.style.opacity  = '0.5';

	var translation = "translate3d("+(this.position.x)+"px,"+(this.position.y)+"px,0px)";
	this.domElem.style.transform = translation;
	this.domElem.style.webkitTransform = translation;

	// this.domElemWidth = this.domElem.offsetWidth;//usefull for positionning name and speaker
	// this.domElemHeight = this.domElem.offsetHeight;//usefull for positionning name and speaker
}

AttackZone.prototype.destroy = function() {
	this.cleanDom();
}

AttackZone.prototype.cleanDom = function() {
	var parentNode =  this.domElem.parentNode;
	if(parentNode) parentNode.removeChild(this.domElem);
}

module.exports = AttackZone;