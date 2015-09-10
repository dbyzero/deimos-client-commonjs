var Element = require('./Element');
var ServerConfig = require('../Config');
var inherit = require('../tools/inherit');
var Message = require('../Message')[ServerConfig.messageLevel];

var Avatar = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow, skin, remote ) {

	this.domId = 'avatar_' + id + '_' + new Date().getTime() + '_' + Math.floor((Math.random()*1000000)+1); ;
	Avatar._super.call(this, id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow, skin );

	this.remote = remote;
	this.userActions = {};
	this.userActionIntegrated = 0;
	this.userInputs = {};
	this.userInputRemote = new Vector(0,0);
	this.item_slot_head = null;
	this.item_slot_foot = null;
	this.item_slot_chest = null;
	this.item_slot_left_hand = null;
	this.item_slot_right_hand = null;

	this.collisionTypeEnabled['plateforme'] = true;
	this.collisionTypeEnabled['bonus'] = true;
	this.collisionTypeEnabled['projectiles'] = true;
	this.collisionTypeEnabled['monsters'] = true;
	this.collisionTypeEnabled['avatars'] = true;

	this.type = 'avatar';
};

inherit(Avatar,Element);

Avatar.prototype.init = function(controlled) {
	Avatar._super.prototype.init.call(this);

	//set spritesheet
	this.domElem.style.backgroundImage = "url("+ServerConfig.custom.serverAssetURL+"/spritesheet/char/"+this.id+"/spritesheet.png)";

	this.initSpeaker(!this.remote);
}

Avatar.prototype.initAnimation = function() {
	this.dictClass['walking_right']	 = 'avatarAnimationWalkingRight';
	this.dictClass['walking_left']	 = 'avatarAnimationWalkingLeft';
	this.dictClass['standing_right'] = 'avatarAnimationStandingRight';
	this.dictClass['standing_left']	 = 'avatarAnimationStandingLeft';
	this.dictClass['flying_right']	 = 'avatarAnimationFlyingRight';
	this.dictClass['flying_left']	 = 'avatarAnimationFlyingLeft';
	this.dictClass['shooting_right'] = 'avatarAnimationShootingRight';
	this.dictClass['shooting_left']	 = 'avatarAnimationShootingLeft';
	this.dictClass['front']			 = 'avatarAnimationFront';
}

Avatar.prototype.addUserInputs = function(mvt) {
	this.userInputs[mvt.id] = mvt ;
}

Avatar.prototype.removeUserInputs = function(type) {
	for(id in this.userInputs) {
		var input = this.userInputs[id];
		if(input.type === type) {
			input.duration = new Date().getTime() - input.startTimestamp;
		}
	}
}

Avatar.prototype.update = function(dt, now) {
	//call parent update
	Avatar._super.prototype.update.call(this,dt,now);

	//adding user action through keyboard to the movement
	for(id in this.userInputs) {
		var input = this.userInputs[id];
		this.toMove.x += parseFloat(input.movement.x * dt/1000 * Math.min(1,input.durationIntegrated/100));//to make possible small mvt
		this.toMove.y += parseFloat(input.movement.y * dt/1000);
		input.durationIntegrated += dt;

		//finish the interpolation
		if(input.duration !== null) {
			//si on a trop integrer, on change le total integrer a la l'integration reel
			//pour ne pas faire de retour
			input.duration = Math.max(input.durationIntegrated,input.duration);
			var missingIntegration = input.duration - input.durationIntegrated;

			this.toMove.x += parseFloat((input.movement.x * missingIntegration/1000));
			this.toMove.y += parseFloat((input.movement.y * missingIntegration/1000));

			this.emit('movementStop',input);
			delete this.userInputs[id];
		}
	}

	if(this.remote === true) {
		if(this.userActions.length === 0) {
			this.userActionIntegrated = 0;
		} else {
			if(this.userActions.indexOf('left') !== -1) {
				this.toMove.x -= this.move_speed  * dt/1000 * Math.min(1,this.userActionIntegrated/100);
				this.userActionIntegrated += dt;
			}
			if(this.userActions.indexOf('right') !== -1) {
				this.toMove.x += this.move_speed * dt/1000 * Math.min(1,this.userActionIntegrated/100);
				this.userActionIntegrated += dt;
			}
		}
	}


	// this.postUpdate(dt, now);
}

Avatar.prototype.onElementCollision = function(collisionCoord, collisionElement) {
	if(collisionElement.type === 'item') {
		collisionElement.destroy();
	}
};

module.exports = Avatar;