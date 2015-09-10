var Element = require('./Element');
var ServerConfig = require('../Config');
var inherit = require('../tools/inherit');
var Message = require('../Message')[ServerConfig.messageLevel];

var Monster = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow, templateId, skin, color ) {

	this.color = color;
	this.skin = skin;

	this.domId = 'monster_' + id + '_' + new Date().getTime() + '_' + Math.floor((Math.random()*1000000)+1); ;
	Monster._super.call(this, id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow, skin );

	this.collisionTypeEnabled['plateforme'] = true;
	this.collisionTypeEnabled['projectiles'] = true;
	this.collisionTypeEnabled['avatars'] = true;

	this.collisionTypeEnabled['bonus'] = false;
	this.collisionTypeEnabled['monsters'] = false;

	this.type = 'monster';
};

inherit(Monster,Element);

Monster.prototype.init = function(controlled) {
	Monster._super.prototype.init.call(this);

	// this.domElem.className = "monster_"+this.skin;
	// this.domElem.style.backgroundImage = "url("+
	// 	ServerConfig.custom.serverAssetURL+"
	// 	/spritesheet/monster/"+
	// 	this.templateid+
	// 	"/"+
	// 	this.color+
	// 	"/spritesheet.png)";
	this.domElem.style.backgroundColor = '#'+this.color;


	this.initSpeaker(false);
}

Monster.prototype.update = function(dt, now) {
	Monster._super.prototype.update.call(this, dt, now);
}

Monster.prototype.postUpdate = function(dt, now) {
	Monster._super.prototype.postUpdate.call(this, dt, now);
	//speed up movement to reach server position
	if( this.orientation === 'left' ) {
		if(this.serverPosition.x < this.position.x) {
			this.position.x -= 1;
		}
	}
	if( this.orientation === 'right' ) {
		if(this.serverPosition.x > this.position.x) {
			this.position.x += 1;
		}
	}
}

Monster.prototype.onBlockCollisionLeft = function() {
	invertDirection.call(this);
}

Monster.prototype.onBlockCollisionRight = function() {
	invertDirection.call(this);
}

Monster.prototype.onAreaCollisionLeft = function() {
	invertDirection.call(this);
}

Monster.prototype.onAreaCollisionRight = function() {
	invertDirection.call(this);
}

var invertDirection = function() {
	this.velocity.x = -1*parseFloat(this.velocity.x);
}

Monster.prototype.initAnimation = function() {
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

module.exports = Monster;