var ServerConfig = require('../Config');
var Message = require('../Message')[ServerConfig.messageLevel];

var Avatar = require('../models/Avatar');
var Monster = require('../models/Monster');
var Item = require('../models/Item');
var AttackZone = require('../models/AttackZone');

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
	syncAvatarFromServer(dataAvatar);
}

Scene.syncMonsterFromServer = function(dataMonster) {
	syncMonsterFromServer(dataMonster);
}

Scene.syncItemFromServer = function(dataItem) {
	syncItemFromServer(dataItem);
}

Scene.syncProjectileFromServer = function(dataItem) {
	syncProjectileFromServer(dataItem);
}

Scene.addAttackZoneFromServer = function(dataAttackZone) {
	var attackZone = new AttackZone(
		dataAttackZone[Message['MESSAGE_ELEMENT_ID']],
		dataAttackZone[Message['MESSAGE_POSITION']],
		dataAttackZone[Message['MESSAGE_SIZE']],
		dataAttackZone[Message['MESSAGE_OWNER']],
		dataAttackZone[Message['MESSAGE_DURATION']]
	);
	attackZone.render();
	domElemScene.appendChild(attackZone.domElem);
	Scene.attackZones[attackZone.id] = attackZone;
	setTimeout(
		function(){
			attackZone.cleanDom();
			delete attackZone;
			delete Scene.attackZones[attackZone.id]
		},
		attackZone.duration
	);
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

	//sync monster
	var monsterUpdated = [];
	var monsters = data[Message.MONSTERS];
	for(var k in monsters) {
		if(syncMonsterFromServer(monsters[k])) {
			monsterUpdated.push(parseInt(monsters[k].id));
		}
	}
	//clean monster
	for(var i in Scene.monsters) {
		var m_id = Scene.monsters[i].id;
		if(monsterUpdated.indexOf(m_id) === -1) {
			Scene.monsters[m_id].destroy();
		}
	}

	//sync item
	var itemUpdated = [];
	var items = data[Message.ITEMS];
	for(var k in items) {
		if(syncItemFromServer(items[k])) {
			itemUpdated.push(parseInt(items[k].id));
		}
	}
	//clean items
	for(var i in Scene.items) {
		var i_id = Scene.items[i].id;
		if(itemUpdated.indexOf(i_id) === -1) {
			Scene.items[i_id].destroy();
		}
	}
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
	// keys = Object.keys(Scene.attackZones);
	// for(i=0;i<keys.length;i++) {
	// 	if(Scene.attackZones[keys[i]].update(dt,now) == false){
	// 		Scene.attackZones[keys[i]].destroy();
	// 		delete Scene.attackZones[keys[i]];
	// 	};
	// }

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
	avatar.appendInto(domElemScene);
}

Scene.addMonster = function(monster) {
	if(!monster || !monster.id) {
		throw new Error('Invalid monster');
	}
	Scene.monsters[monster.id] = monster;
	monster.appendInto(domElemScene);
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

	if(avatar.removed) {
		return false;
	}

	//synchro des infos
	avatar.moveSpeed		= avatarData[Message.MESSAGE_MOVE_SPEED];
	avatar.jumpSpeed		= avatarData[Message.MESSAGE_JUMP_SPEED];
	avatar.goingDown		= avatarData[Message.MESSAGE_GOING_DOWN];
	avatar.velocity.x		= avatarData[Message.MESSAGE_VELOCITY].x;
	avatar.velocity.y		= avatarData[Message.MESSAGE_VELOCITY].y;

	avatar.serverPosition.x		= avatarData[Message.MESSAGE_POSITION].x;
	avatar.serverPosition.y		= avatarData[Message.MESSAGE_POSITION].y;
	//> 100px circle curently
	if(
		Math.pow(avatar.position.x - avatar.serverPosition.x,2) +
		Math.pow(avatar.position.y - avatar.serverPosition.y,2)
		> ServerConfig.SQUARE_AUTHORITY
	) {
		avatar.position.x		= avatarData[Message.MESSAGE_POSITION].x;
		avatar.position.y		= avatarData[Message.MESSAGE_POSITION].y;
	}

	avatar.acceleration.x	= avatarData[Message.MESSAGE_ACCELERATION].x;
	avatar.acceleration.y	= avatarData[Message.MESSAGE_ACCELERATION].y;

	//if server say that we land, we sync status + Y position
	if(avatar.isLanded != avatarData[Message.MESSAGE_LANDED]) {
		avatar.isLanded			= avatarData[Message.MESSAGE_LANDED];
		avatar.position.y = avatarData[Message.MESSAGE_POSITION].y;
	}

	avatar.HP				= avatarData[Message.MESSAGE_CURRENT_HP];
	avatar.maxHP			= avatarData[Message.MESSAGE_HP];
	avatar.userActions		= avatarData[Message.MESSAGE_USER_INPUT];
	avatar.orientation		= avatarData[Message.MESSAGE_ANIMATION][Message.MESSAGE_DIRECTION];
	avatar.speaker.setText(avatarData[Message.MESSAGE_SAYING]);

	if(avatarData[Message.MESSAGE_SAYING].length > 0) {
		avatar.speaker.show();
	} else {
		if(avatar.speaking === false) {
			avatar.speaker.hide();
		}
	}

	avatar.render();
	return true;

}

var syncMonsterFromServer = function( monsterData ) {
	//make it if needed
	var monster = Scene.monsters[monsterData[Message['ID']]];
	if(monster === undefined) {
		monster = new Monster(
			monsterData[Message['ID']],
			monsterData[Message['NAME']],
			new Vector(monsterData[Message['MESSAGE_POSITION']].x,monsterData[Message['MESSAGE_POSITION']].y),
			monsterData[Message['MESSAGE_SIZE']],
			monsterData[Message['MESSAGE_ORIENTATION']],
			monsterData[Message['MESSAGE_MASS']],
			monsterData[Message['MESSAGE_MOVE_SPEED']],
			monsterData[Message['MESSAGE_JUMP_SPEED']],
			monsterData[Message['MESSAGE_HP']],
			monsterData[Message['MESSAGE__CURRENT_HP']],
			monsterData[Message['MESSAGE_DELTASHOW']],
			monsterData[Message['MESSAGE_ELEMENT_ID']],
			monsterData[Message['MESSAGE_SKIN']],
			monsterData[Message['MESSAGE_COLOR']]
		);
		monster.HP = monsterData[Message['MESSAGE_CURRENT_HP']];
		monster.maxHP = monsterData[Message['MESSAGE_HP']];
		monster.init();
		Scene.addMonster(monster);
	}

	if(monster.removed) {
		return false;
	}

	monster.velocity.x			= monsterData[Message.MESSAGE_VELOCITY].x;
	monster.velocity.y			= monsterData[Message.MESSAGE_VELOCITY].y;
	monster.serverPosition.x	= monsterData[Message.MESSAGE_POSITION].x;
	monster.serverPosition.y	= monsterData[Message.MESSAGE_POSITION].y;
	monster.acceleration.x		= monsterData[Message.MESSAGE_ACCELERATION].x;
	monster.acceleration.y		= monsterData[Message.MESSAGE_ACCELERATION].y;
	monster.orientation			= monsterData[Message.MESSAGE_ANIMATION][Message.MESSAGE_DIRECTION];
	monster.HP					= monsterData[Message['MESSAGE_CURRENT_HP']];
	monster.maxHP				= monsterData[Message['MESSAGE_HP']];

	// console.log(monster);

	monster.render();
	return true;
}

var syncItemFromServer = function( itemData ) {
	//make it if needed
	var item = Scene.items[itemData[Message['ID']]];
	if(item === undefined) {
		item = new Item(
			itemData[Message['ID']],
			itemData[Message['NAME']],
			new Vector(itemData[Message['MESSAGE_POSITION']].x,itemData[Message['MESSAGE_POSITION']].y),
			itemData[Message['MESSAGE_SIZE']],
			itemData[Message['MESSAGE_ORIENTATION']],
			itemData[Message['MESSAGE_MASS']],
			0,//maybe usefull later ?
			0,//maybe usefull later ?
			itemData[Message['MESSAGE_DELTASHOW']],
			itemData[Message['MESSAGE_ELEMENT_ID']],
			itemData[Message['MESSAGE_SKIN']],
			itemData[Message['MESSAGE_COLOR']]
		);
		item.HP = itemData[Message['MESSAGE_CURRENT_HP']];
		item.maxHP = itemData[Message['MESSAGE_HP']];
		item.init();
		Scene.addMonster(item);
	}

	if(item.removed) {
		return false;
	}

	item.velocity.x			= itemData[Message.MESSAGE_VELOCITY].x;
	item.velocity.y			= itemData[Message.MESSAGE_VELOCITY].y;
	item.serverPosition.x	= itemData[Message.MESSAGE_POSITION].x;
	item.serverPosition.y	= itemData[Message.MESSAGE_POSITION].y;
	item.acceleration.x		= itemData[Message.MESSAGE_ACCELERATION].x;
	item.acceleration.y		= itemData[Message.MESSAGE_ACCELERATION].y;
	item.orientation		= itemData[Message.MESSAGE_ORIENTATION];

	item.render();
	return true;
}

var syncProjectileFromServer = function( projectileData ) {
	debugger;
	return true;
}

module.exports = Scene;

if(ServerConfig.mode === 'debug') {
	window.DeimosScene = Scene;
}
