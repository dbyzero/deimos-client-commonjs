var Element = require('./Element');
var ServerConfig = require('../Config');
var inherit = require('../tools/inherit');
var Message = require('../Message')[ServerConfig.messageLevel];

var Item = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, deltashow, templateId, skin, color ) {

	this.color = color;
	this.skin = skin;

	this.domId = 'item_' + id + '_' + new Date().getTime() + '_' + Math.floor((Math.random()*1000000)+1); ;
	Item._super.call(this, id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, null, null, deltashow, skin );

	this.collisionTypeEnabled['plateforme'] = true;
	this.collisionTypeEnabled['avatars'] = true;

	this.collisionTypeEnabled['projectiles'] = false;
	this.collisionTypeEnabled['bonus'] = false;
	this.collisionTypeEnabled['monsters'] = false;

	this.type = 'item';
};

inherit(Item,Element);

Item.prototype.init = function(controlled) {
	Item._super.prototype.init.call(this);

	// this.domElem.className = "item_"+this.skin;
	// this.domElem.style.backgroundImage = "url("+
	// 	ServerConfig.custom.serverAssetURL+"
	// 	/spritesheet/item/"+
	// 	this.templateid+
	// 	"/"+
	// 	this.color+
	// 	"/spritesheet.png)";
	this.domElem.style.backgroundColor = '#'+this.color;
}

Item.prototype.update = function(dt, now) {
	Item._super.prototype.update.call(this, dt, now);
}


Item.prototype.onElementCollision = function(collisionCoord, collisionElement) {
	if(collisionElement.type === 'avatar') {
		this.destroy();
	}
};

Item.prototype.initAnimation = function() {
	this.dictClass['walking_right']	 = this.skin + 'AnimationWalkingRight';
	this.dictClass['walking_left']	 = this.skin + 'AnimationWalkingLeft';
	this.dictClass['standing_right'] = this.skin + 'AnimationStandingRight';
	this.dictClass['standing_left']	 = this.skin + 'AnimationStandingLeft';
	this.dictClass['flying_right']	 = this.skin + 'AnimationFlyingRight';
	this.dictClass['flying_left']	 = this.skin + 'AnimationFlyingLeft';
	this.dictClass['shooting_right'] = this.skin + 'AnimationShootingRight';
	this.dictClass['shooting_left']	 = this.skin + 'AnimationShootingLeft';
	this.dictClass['front']			 = this.skin + 'AnimationFront';
}

module.exports = Item;