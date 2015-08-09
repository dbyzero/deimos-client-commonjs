var Element = require('./Element');
var ServerConfig = require('../Config');
// var Engine = require('../Engine');
var inherit = require('../tools/inherit');

var Avatar = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow ) {

	this.domId = 'avatar_' + id + '_' + new Date().getTime() + '_' + Math.floor((Math.random()*1000000)+1); ;
	Avatar._super.call(this, id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow );


	this.waitingForce = [];
	this.userInputs = {};
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
};

inherit(Avatar,Element);

Avatar.prototype.init = function() {
	// Avatar._super.prototype.init.call(this);

	this.initAnimation();

	//set spritesheet
	this.domElem.style.backgroundImage = "url("+ServerConfig.custom.serverAssetURL+"/spritesheet/char/"+this.id+"/spritesheet.png)";

	//add speaker
	// this.initSpeaker(var readOnly = false);
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

	//toggle speaker if needed
	// if(this.speaking) {
	// 	var new_saying = this.getSaying();
	// 	if(this.saying !== new_saying) {
	// 		this.saying = new_saying;
	// 		EventManager.fire('org.dbyzero.deimos.network.sendSync');
	// 	}
	// } else {
	// 	if(this.lastSayed + 5000 < now && this.saying !== '') {
	// 		this.speaker.hide();
	// 		this.speaker.setText('');
	// 		this.saying = '';
	// 		EventManager.fire('org.dbyzero.deimos.network.sendSync');
	// 	} 
	// }

	//call parent update
	Avatar._super.prototype.update.call(this,dt,now);

	//adding user action through keyboard to the movement
	for(id in this.userInputs) {
		var input = this.userInputs[id];
		this.toMove.x += parseFloat(input.movement.x * dt/1000 * Math.min(1,input.durationIntegrated/100));//to make possible small mvt
		this.toMove.y += parseFloat(input.movement.y * dt/1000);
		input.durationIntegrated = input.durationIntegrated + dt;

		//finish the interpolation
		if(input.duration !== null) {
			//si on a trop integrer, on change le total integrer a la l'integration reel
			//pour ne pas faire de retour
			input.duration = Math.max(input.durationIntegrated,input.duration);
			var missingIntegration = input.duration - input.durationIntegrated;

			this.toMove.x += parseFloat((input.movement.x * missingIntegration/1000));
			this.toMove.y += parseFloat((input.movement.y * missingIntegration/1000));

			Engine.sendMessage(Message['ACTION_MOVE_STOP'],input);
			delete this.userInputs[id];
		}
	}
}

module.exports = Avatar;