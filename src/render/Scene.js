var ServerConfig = require('../Config');
var Message = require('../Message')[ServerConfig.messageLevel];

var Avatar = require('../models/Avatar');

var Scene = {};
Scene.items			= {};
Scene.avatars		= {};
Scene.projectiles	= {};
Scene.attackZones	= {};
Scene.monsters		= {};
Scene.blocks		= {};
var dataToParse		= {};
var domElemScene	= null;

Scene.init = function(data){

	domElemScene = document.getElementById(ServerConfig.custom.domId);
	if(domElemScene === undefined || domElemScene === null) {
		throw new Error('Cannot find domElement');
	}

	Scene.name = data[Message['MESSAGE_GAME_AREA_NAME']]
	Scene.width = data[Message['MESSAGE_GAME_AREA_WIDTH']]
	Scene.height = data[Message['MESSAGE_GAME_AREA_HEIGHT']]
	Scene.blocks = data[Message['MESSAGE_GAME_AREA_BLOCKS']]

	//keep game datas in configuration
	ServerConfig.scene = this;

	renderCollistionArea();
}

Scene.syncAvatarFromServer = function(dataAvatar) {
	// console.log(dataAvatar);
	syncAvatarFromServer(dataAvatar);
}

Scene.parseData = function(data) {
	// console.log(data);
	/**
	 * AVATARS 
	 */
	//sync avatars
	var avatarUpdated = [];
	var avatars = data[Message.AVATARS];
	for(var k in avatars) {
		if(syncAvatarFromServer(avatars[k])) {
			avatarUpdated.push(parseInt(avatars[k].id));
		}
	}

	//clean avatar
	for(var i in Scene.avatars) {
		var av_id = Scene.avatars[i].id;
		if(avatarUpdated.indexOf(av_id) === -1) {
			Scene.avatars[av_id].destroy();
		}
	}

	console.log(data);
}

Scene.update = function(dt) {

	//update
	var keys,i;
	var now = new Date().getTime();

	keys = Object.keys(Scene.items);
	for(i=0;i<keys.length;i++) {
		Scene.items[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.avatars);
	for(i=0;i<keys.length;i++) {
		Scene.avatars[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.projectiles);
	for(i=0;i<keys.length;i++) {
		Scene.projectiles[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.monsters);
	for(i=0;i<keys.length;i++) {
		Scene.monsters[keys[i]].update(dt,now);
	}
	keys = Object.keys(Scene.attackZones);
	for(i=0;i<keys.length;i++) {
		if(Scene.attackZones[keys[i]].update(dt,now) == false){
			Scene.attackZones[keys[i]].destroy();
			delete Scene.attackZones[keys[i]];
		};
	}

	//move and render avatars !
	keys = Object.keys(Scene.avatars);
	for(i=0;i<keys.length;i++) {
		var avatar = Scene.avatars[keys[i]];
		avatar.move();
		avatar.updateAnimation();
		// avatar.addingWaitingForces();
	}
	//move and render Scene.projectiles !
	keys = Object.keys(Scene.projectiles);
	for(i=0;i<keys.length;i++) {
		Scene.projectiles[keys[i]].move();
	}
	//move and render entities !
	keys = Object.keys(Scene.items);
	for(i=0;i<keys.length;i++) {
		Scene.items[keys[i]].move();
	}
	//move and render Scene.monsters !
	keys = Object.keys(Scene.monsters);
	for(i=0;i<keys.length;i++) {
		var monster = Scene.monsters[keys[i]];
		monster.move();
		// monster.updateAnimation();
	}
}

Scene.addAvatar = function(avatar) {
	if(!avatar || !avatar.id) {
		throw new Error('Invalid avatar');
	}
	Scene.avatars[avatar.id] = avatar;
	domElemScene.appendChild(avatar.domElem)
}

var renderCollistionArea = function(blocks) {
	if(domElemScene === undefined || domElemScene === null) {
		throw new Error('Cannot find domElement');
	}

	for (var key = 0; key < Scene.blocks.length; key++) {
		//game stuff
		var block = Scene.blocks[key];

		//dom stuff
		var domBlock = document.createElement('div');
		domBlock.style.position = 'absolute';
		domBlock.style.backgroundColor = 'red';
		domBlock.style.width = block.width+'px';
		domBlock.style.height = block.height+'px';
		domBlock.style.left = block.position.x+'px';
		domBlock.style.top = block.position.y+'px';
		domBlock.style.backgroundColor = 'rgb(186, 186, 186)';
		domElemScene.appendChild(domBlock);
	};
}

var syncAvatarFromServer = function(avatarData) {
	var av_id = avatarData[Message.ID];
	var avatar = Scene.avatars[av_id];

	if( avatar === undefined ) {
		avatar = Scene.avatars[av_id] = new Avatar(
			av_id,
			avatarData[Message.NAME],
			new Vector(avatarData[Message.MESSAGE_POSITION].x, avatarData[Message.MESSAGE_POSITION].y),
			new Vector(avatarData[Message.MESSAGE_SIZE].x, avatarData[Message.MESSAGE_SIZE].y),
			avatarData[Message.MESSAGE_ANIMATION][Message.MESSAGE_DIRECTION],
			avatarData[Message.MESSAGE_MASS],
			avatarData[Message.MESSAGE_MOVE_SPEED],
			avatarData[Message.MESSAGE_JUMP_SPEED],
			avatarData[Message.MESSAGE_HP],
			avatarData[Message.MESSAGE_CURRENT_HP],
			avatarData[Message.MESSAGE_DELTASHOW],
			avatarData[Message.MESSAGE_SKIN],
			true // is remote
		) ;
		Scene.addAvatar(avatar);
	}

	//synchro des infos
	avatar.moveSpeed		= avatarData[Message.MESSAGE_MOVE_SPEED];
	avatar.jumpSpeed		= avatarData[Message.MESSAGE_JUMP_SPEED];
	avatar.goingDown		= avatarData[Message.MESSAGE_GOING_DOWN];
	avatar.velocity.x		= avatarData[Message.MESSAGE_VELOCITY].x;
	avatar.velocity.y		= avatarData[Message.MESSAGE_VELOCITY].y;
	//> 100px circle curently
	if(
		Math.pow(avatar.position.x - avatarData[Message.MESSAGE_POSITION].x,2) +
		Math.pow(avatar.position.y - avatarData[Message.MESSAGE_POSITION].y,2)
		> ServerConfig.SQUARE_AUTHORITY
	) {
		avatar.position.x		= avatarData[Message.MESSAGE_POSITION].x;
		avatar.position.y		= avatarData[Message.MESSAGE_POSITION].y;
	}

	avatar.serverPosition.x		= avatarData[Message.MESSAGE_POSITION].x;
	avatar.serverPosition.y		= avatarData[Message.MESSAGE_POSITION].y;

	avatar.acceleration.x	= avatarData[Message.MESSAGE_ACCELERATION].x;
	avatar.acceleration.y	= avatarData[Message.MESSAGE_ACCELERATION].y;
	avatar.isLanded			= avatarData[Message.MESSAGE_LANDED];
	avatar.HP				= avatarData[Message.MESSAGE_CURRENT_HP];
	avatar.maxHP			= avatarData[Message.MESSAGE_HP];
	avatar.userActions		= avatarData[Message.MESSAGE_USER_INPUT];
	avatar.orientation		= avatarData[Message.MESSAGE_ANIMATION][Message.MESSAGE_DIRECTION];
	avatar.speaker.setText(avatarData[Message.MESSAGE_SAYING] , false);

	avatar.render();
	return true;

}


module.exports = Scene;