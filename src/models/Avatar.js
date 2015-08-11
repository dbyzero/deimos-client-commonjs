var Element = require('./Element');
var Speaker = require('./Speaker');
var ServerConfig = require('../Config');
var inherit = require('../tools/inherit');

var Engine = require('../Engine');
var Message = require('../Message')[ServerConfig.messageLevel];

var Avatar = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow ) {

	this.domId = 'avatar_' + id + '_' + new Date().getTime() + '_' + Math.floor((Math.random()*1000000)+1); ;
	Avatar._super.call(this, id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow );

	//speaking
	this.speaking = false;
	this.lastSayed = 0;
	this.saying = "";
	this.speaker;
	this.closingSpeakerProcess;

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

Avatar.prototype.init = function(controlled) {
	// Avatar._super.prototype.init.call(this);

	this.initAnimation();

	//set spritesheet
	this.domElem.style.backgroundImage = "url("+ServerConfig.custom.serverAssetURL+"/spritesheet/char/"+this.id+"/spritesheet.png)";

	//add speaker
	this.initSpeaker(!controlled);
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

Avatar.prototype.initSpeaker = function(readonly) {
	this.speaker = new Speaker(this.domId, readonly) ;
	this.speaker.init(this);
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

//adding force next step
Avatar.prototype.addForceNextStep = function(force) {
	this.waitingForce.push(force) ;
}

Avatar.prototype.addingWaitingForces = function() {
	var forces = this.waitingForce;
	for(force in forces) {
		this.velocity.add(forces[force]);
		this.waitingForce.splice(0,1);
	}
}

Avatar.prototype.toggleSpeaking = function () {
	this.speaking = !this.speaking;
	if(this.speaking) {
		clearTimeout(this.closingSpeakerProcess);
		this.speaker.show();
	} else {
		this.speaker.leaveFocus();
		if(this.saying.length > 0) {
			this.closingSpeakerProcess = setTimeout(
				function(){
					this.speaker.hide();
				}.bind(this),
				ServerConfig.speakerCloseDelay
			);
		} else {
			this.speaker.hide();
		}
	}
}

Avatar.prototype.update = function(dt, now) {

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

			this.emit('movementStop',input);
			delete this.userInputs[id];
		}
	}
}

module.exports = Avatar;