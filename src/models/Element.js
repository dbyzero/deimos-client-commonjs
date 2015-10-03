var ServerConfig = require('../Config');
var Vector = require('../tools/Vector')
var Physics = require('../tools/Physics')
var EventEmitter = require('events').EventEmitter;
var Speaker = require('./Speaker');
var inherit = require('../tools/inherit');

var Element = function( id, name, position, size, orientation, mass, moveSpeed, jumpSpeed, maxHP, HP, deltashow, skin ) {
	//speaking
	this.speaking = false;
	this.speaker = null;
	this.closingSpeakerProcess;

	//attributs
	this.id = id;
	this.name = name;
	this.position = position;
	this.velocity = new Vector(0,0);
	this.acceleration = new Vector(0,0);
	this.size = size;
	this.orientation = orientation;
	this.mass = mass;
	this.move_speed = moveSpeed;
	this.jump_speed = jumpSpeed;
	this.maxHP = maxHP;
	this.HP = HP;
	this.dictClass = {};
	this.attack = false;
	this.attackRate = null;
	this.oriented = 'right';
	this.speaker = null;
	this.skin = skin;

	//trackers
	this.serverPosition = new Vector(this.position.x, this.position.y);
	this.lastAttack = null;
	this.skipNextUpdateAndMove = false;
	this.isLanded = false;
	this.toMove = new Vector(0,0);
	this.lastUpdate = new Date().getTime();
	this.landedBlock = null;
	this.currentAction = 'stand';
	this.goingDown = false;

	//Physic configuration
	this.collisionTypeEnabled = {};

	this.collisionTypeEnabled['blocks'] = true;
	this.collisionTypeEnabled['gameArea'] = true;
	this.collisionTypeEnabled['plateforme'] = false;
	this.collisionTypeEnabled['bonus'] = false;
	this.collisionTypeEnabled['projectiles'] = false;
	this.collisionTypeEnabled['monsters'] = false;
	this.collisionTypeEnabled['avatars'] = false;

	//graphic stuff
	this.deltashow = deltashow;
	this.domElem = null;
	this.domElemWidth = null;
	this.domElemHeight = null;
	this.domElemHP = null;
	this.vertexTL = new Vector(this.position.x, this.position.y);
	this.vertexBL = new Vector(this.position.x, this.position.y + this.size.y);
	this.vertexTR = new Vector(this.position.x + this.size.x, this.position.y);
	this.vertexBR = new Vector(this.position.x + this.size.x, this.position.y + this.size.y);

	//create dom elem
	var dom_elem = document.createElement("div");
	dom_elem.setAttribute("id",this.domId);

	dom_elem.style.width = parseInt(this.size.x + this.deltashow.x*2)+'px';
	dom_elem.style.height  = parseInt(this.size.y + this.deltashow.y)+'px';

	dom_elem.style.display  = 'block';
	dom_elem.style.position  = 'absolute';

	var translation = "translate3d("+(this.position.x-this.deltashow.x)+"px,"+(this.position.y-this.deltashow.y)+"px,0px)";
	dom_elem.style.transform = translation;
	dom_elem.style.webkitTransform = translation;

	dom_elem.style.backgroundColor = 'green';
	dom_elem.style.zIndex = 10;

	this.domElem = dom_elem;
	this.domElemWidth = this.domElem.offsetWidth;//usefull for positionning name and speaker
	this.domElemHeight = this.domElem.offsetHeight;//usefull for positionning name and speaker

	this.type = 'element';
	this.removed = false;

	//create server dom elem for debug
	if(ServerConfig.showRemote) {
		var dom_elem_server = document.createElement("div");
		dom_elem_server.setAttribute("id",this.domId+'_server');

		dom_elem_server.style.width = parseInt(this.size.x + this.deltashow.x*2)+'px';
		dom_elem_server.style.height  = parseInt(this.size.y + this.deltashow.y)+'px';

		dom_elem_server.style.display  = 'block';
		dom_elem_server.style.position  = 'absolute';

		var translation = "translate3d("+(this.serverPosition.x - this.deltashow.x)+"px,"+(this.serverPosition.y - this.deltashow.y)+"px,0px)";
		dom_elem_server.style.transform = translation;
		dom_elem_server.style.webkitTransform = translation;

		dom_elem_server.style.backgroundColor = 'red';
		dom_elem_server.innerHTML = this.name;
		dom_elem.style.zIndex = 9;
		this.domElemServer = dom_elem_server;
	}

	this.init();
};

inherit(Element,EventEmitter);

Element.prototype.init = function() {
	this.initAnimation();

	if(!!this.HP && !!this.maxHP) {
		this.initHP();
	}

	if(!!this.name) {
		this.initName();
	}
	this.initVisualCollisonZone();
}

Element.prototype.toggleSpeaking = function () {
	this.speaking = !this.speaking;
	if(this.speaking) {
		clearTimeout(this.closingSpeakerProcess);
		this.speaker.show();
	} else {
		this.speaker.leaveFocus();
		if(this.speaker.getText().length > 0) {
			this.closingSpeakerProcess = setTimeout(
				function(){
					this.speaker.setText("", true);
					this.speaker.hide();
					if(!this.speaker.readonly) {
						this.speaker.emit('textChange', "");
					}
					this.speaker.hide();
				}.bind(this),
				ServerConfig.speakerCloseDelay
			);
		} else {
			this.speaker.hide();
		}
	}
}

Element.prototype.initSpeaker = function(editable) {
	this.speaker = new Speaker(this.domId, editable) ;
	this.speaker.init(this);
}

Element.prototype.initAnimation = function() {
	//stub
};

Element.prototype.initHP = function() {
	var domElemHP = document.createElement("div");
	domElemHP.setAttribute("id",this.domId+'_hp') ;

	domElemHP.style.position = "absolute";
	domElemHP.style.display  = 'block' ;
	domElemHP.style.zIndex = 10;
	domElemHP.style.width = parseInt((this.HP/this.maxHP) * 100)+'%';
	domElemHP.style.height = '10px';
	domElemHP.style.marginTop = '18px';
	domElemHP.style.marginLeft = '-1px';
	domElemHP.style.border = '1px solid black';
	domElemHP.style.backgroundColor = '#A4C3A0';
	domElemHP.style.opacity = '0.6';

	this.domElem.appendChild(domElemHP) ;

	this.domElemHP = domElemHP;
};

Element.prototype.initVisualCollisonZone = function() {
	var domElemCollideZone = document.createElement("div");
	domElemCollideZone.style.position = "absolute";
	domElemCollideZone.style.display  = 'block' ;
	domElemCollideZone.style.zIndex = 12;
	domElemCollideZone.style.width = this.size.x + 'px';
	domElemCollideZone.style.height = this.size.y + 'px';
	domElemCollideZone.style.marginTop = this.deltashow.y+'px';
	domElemCollideZone.style.marginLeft = this.deltashow.x+'px';
	domElemCollideZone.style.backgroundColor = '#ffffff';
	domElemCollideZone.style.opacity = '0.5';

	this.domElem.appendChild(domElemCollideZone) ;
};

Element.prototype.initName = function() {
	var domElemName = document.createElement("div");
	domElemName.setAttribute("id",this.domId+'_name') ;

	domElemName.style.position = "absolute";
	domElemName.style.display  = 'block' ;
	domElemName.style.zIndex = 9;
	domElemName.style.width = '100%';
	domElemName.style.textAlign = 'center';
	domElemName.innerHTML = this.name;
	domElemName.style.fontSize = '16px';
	domElemName.style.fontFamily = 'sans-serif';
	domElemName.style.fontWeight = 'bold';

	this.domElem.appendChild(domElemName) ;

	this.domElemName = domElemName;
};

Element.prototype.destroy= function() {
	this.removed = true;
	this.cleanDom();
};

Element.prototype.cleanDom = function() {
	// this.cleanDomSpeaker();
	this.cleanDomElem();
};

Element.prototype.cleanDomElem = function() {
	if(this.speaker !== null) {
		this.speaker.destroy();
	}
	if(this.domElem) {
		var nodeAvatar = this.domElem;
		var parentNode = nodeAvatar.parentNode;
		if(parentNode) parentNode.removeChild(nodeAvatar);
		delete this.domName;
		delete this.domHP;
		delete this.domElem;
	}
};

Element.prototype.update = function(dt, now) {
	if(!!this.skipNextUpdateAndMove) {
		return;
	}

	//fly if we have a negative vertical deplacement OR we leave our blocks
	if((this.isLanded && this.velocity.y < 0) ||
		(!!this.landedBlock && (this.position.x + this.size.x < this.landedBlock.vertexTL.x || this.position.x > this.landedBlock.vertexTR.x ))) {
		this.unlanded();
	}

	//adding gravity if we are not landed or outside of our landed block
	if(!this.isLanded) {
		this.acceleration.x = ServerConfig.Gravity.x;
		this.acceleration.y =  ServerConfig.Gravity.y * this.mass;
	} else {
		this.acceleration.y = 0;
	}

	var returnIntegrate = Physics.integrateKM4(this.position,this.velocity,this.acceleration,dt/1000);
	this.toMove.x += returnIntegrate.dx.x;
	this.toMove.y += returnIntegrate.dx.y;
	this.velocity.x += returnIntegrate.dv.x;
	this.velocity.y += returnIntegrate.dv.y;

	this.lastUpdate = now;

	this.postUpdate(dt, now);
};

Element.prototype.postUpdate = function(dt, now) {
	//THIS CODE DONT WORK AT ALL !!!
	// //to correct element position with server, on a same direction
	// // 1. if the element is too far on server, we add movement to sync both position.
	// // 2. if the element is too far on client, we negate movement to sync both position.
	// if( this.orientation === 'left' ) {
	// 	if(this.serverPosition.x < this.position.x) {
	// 		//the Math.min is used to not go through the server position
	// 		this.toMove.x = -1 * Math.min(
	// 			(this.move_speed * dt/1000),
	// 			(this.position.x - this.serverPosition.x)
	// 		);
	// 	}
	// 	//It dont work because server sync is slower than framerate
	// 	// if(this.serverPosition.x > this.position.x) {
	// 	// 	this.toMove.x = 0;
	// 	// }
	// }
	// if( this.orientation === 'right' ) {
	// 	if(this.serverPosition.x > this.position.x) {
	// 		//the Math.min is used to not go through the server position
	// 		this.toMove.x = Math.min(
	// 			(this.move_speed * dt/1000),
	// 			(this.serverPosition.x - this.position.x)
	// 		);
	// 	}
	// 	//It dont work because server sync is slower than framerate
	// 	// if(this.serverPosition.x < this.position.x) {
	// 	// 	this.toMove.x = 0;
	// 	// }
	// }
}

Element.prototype.move = function() {
	if(!!this.skipNextUpdateAndMove) {
		this.skipNextUpdateAndMove = false;
		return;
	}

	if( this.toMove.x === 0 && this.toMove.y === 0) {
		this.currentAction = 'stand';
		return false;
	} else {
		var currentMovement = this.toMove;
	}

	var initialPosition = {x:this.position.x,y:this.position.y};

	//move ~~~~~
	this.position.add(currentMovement);

	//check collision with Zone
	if(this.position.x < 0) {
		this.position.x = 0;
		this.onAreaCollisionLeft();
	}
	if(this.position.x + this.size.x > ServerConfig.scene.width) {
		this.position.x = ServerConfig.scene.width - this.size.x;
		this.onAreaCollisionRight();
	}
	if(this.position.y < 0) {
		this.position.y = 0;
		this.onAreaCollisionTop();
	}
	if(this.position.y + this.size.y > ServerConfig.scene.height) {
		this.position.y = ServerConfig.scene.height - this.size.y;
		this.onAreaCollisionBottom();
	}

	//colision with bloacks
	if(this.collisionTypeEnabled['blocks']) this.checkBlocksCollision( currentMovement );
	if(this.collisionTypeEnabled['bonus']) this.checkElementCollision( currentMovement, ServerConfig.scene.items );
	if(this.collisionTypeEnabled['avatars']) this.checkElementCollision( currentMovement, ServerConfig.scene.avatars );
	if(this.collisionTypeEnabled['monsters']) this.checkElementCollision( currentMovement, ServerConfig.scene.monsters );
	if(this.collisionTypeEnabled['projectiles']) this.checkElementCollision( currentMovement, ServerConfig.scene.projectiles );

	var deltaMove = Vector.Sub(this.position,initialPosition);
	if(deltaMove.x != 0 || deltaMove.y !=0) {
		//send sync when move
		this.inMove = true;
		this.render();
		this.onMove();
	} else {
		this.inMove = false
	}

	//reset movement
	this.toMove = Vector.Zero();

	//set animation
	if(deltaMove.x !== 0) {
		this.currentAction = 'walk';
		if(deltaMove.x > 0) this.oriented = 'right';
		if(deltaMove.x < 0) this.oriented = 'left';
	} else {
		this.currentAction = 'stand';
	}
	if(deltaMove.y != 0) {
		this.currentAction = 'fly';
	};

};

Element.prototype.appendInto = function(domElem) {
	domElem.appendChild(this.domElem);
	if(ServerConfig.showRemote) {
		domElem.appendChild(this.domElemServer);
	}
};

Element.prototype.render = function() {
	if(this.position !== undefined && this.removed === false) {
		var X = parseInt(this.position.x - parseInt(this.deltashow.x));
		var Y = parseInt(this.position.y - parseInt(this.deltashow.y));
		var translation = "translate3d("+X+"px,"+Y+"px,0px)";
		this.domElem.style.transform = translation;
		this.domElem.style.webkitTransform = translation;

		if(ServerConfig.showRemote) {
			this.renderServerPosition();
		}

		return true;
	}
	return false;
};

Element.prototype.renderServerPosition = function() {
	if(this.serverPosition !== undefined && this.removed === false) {
		var translation = "translate3d("+(this.serverPosition.x-this.deltashow.x)+"px,"+(this.serverPosition.y-this.deltashow.y)+"px,0px)";
		this.domElemServer.style.transform = translation;
		this.domElemServer.style.webkitTransform = translation;
	}
};

Element.prototype.checkBlocksCollision = function( currentMovement ) {
	//check for collision
	var testCollision = null;
	var keys = Object.keys(ServerConfig.scene.blocks);
	for(var i = 0; i < keys.length; i++) {
		block = ServerConfig.scene.blocks[keys[i]];
		//do not check if we not collide on plateforme
		if(block.type.type === 'plateform' && !this.collisionTypeEnabled['plateforme']) {
			continue;
		}
		//we dont check for collision if avatar go up and block is a plateform
		//collision from avatar bottom
		if(block.type.type != 'plateform' || (block.type.type == 'plateform' && this.goingDown == false)) {
			if(currentMovement.y > 0) {
				testCollision = Physics.SegmentsCollision(
					this.vertexBL,
					{x:this.position.x,y:this.position.y + this.size.y},
					block.vertexTL,
					block.vertexTR
				);
				
				if(testCollision !== false) {
					this.onBlockCollisionBottom(testCollision,block);
					continue;
				}

				testCollision = Physics.SegmentsCollision(
					this.vertexBR,
					{x:this.position.x + this.size.x,y:this.position.y + this.size.y},
					block.vertexTL,
					block.vertexTR
				);
				
				if(testCollision !== false) {
					this.onBlockCollisionBottom(testCollision,block);
					continue;
				}
			}
		}

		//we stop here for plateforme
		if(block.type.type == 'plateform') continue;

		//collision from avatar top
		if(currentMovement.y < 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTL,
				{x:this.position.x,y:this.position.y},
				block.vertexBL,
				block.vertexBR
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionTop(testCollision,block);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexTR,
				{x:this.position.x + this.size.x,y:this.position.y},
				block.vertexBL,
				block.vertexBR
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionTop(testCollision,block);
				continue;
			}
		}

		//collision from avatar left
		if(currentMovement.x < 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTL,
				{x:this.position.x,y:this.position.y},
				block.vertexTR,
				block.vertexBR
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionLeft(testCollision,block);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexBL,
				{x:this.position.x,y:this.position.y + this.size.y},
				block.vertexTR,
				block.vertexBR
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionLeft(testCollision,block);
				continue;
			}
		}

		//collision from avatar right
		if(currentMovement.x > 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTR,
				{x:this.position.x + this.size.x,y:this.position.y},
				block.vertexTL,
				block.vertexBL
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionRight(testCollision,block);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexBR,
				{x:this.position.x + this.size.x,y:this.position.y + this.size.y},
				block.vertexTL,
				block.vertexBL
			);
			
			if(testCollision !== false) {
				this.onBlockCollisionRight(testCollision,block);
				continue;
			}
		}
	}
};

Element.prototype.checkElementCollision = function( currentMovement, elements ) {
	var testCollision = null;
	var keys = Object.keys(elements);
	var i,element;
	for(i = 0; i < keys.length; i++) {
		element = elements[keys[i]];
		//collision from avatar bottom
		if(currentMovement.y > 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexBL,
				{x:this.position.x,y:this.position.y + this.size.y},
				element.vertexTL,
				element.vertexTR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionBottom(testCollision,element);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexBR,
				{x:this.position.x + this.size.x,y:this.position.y + this.size.y},
				element.vertexTL,
				element.vertexTR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionBottom(testCollision,element);
				continue;
			}
		}

		//collision from avatar top
		if(currentMovement.y < 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTL,
				{x:this.position.x,y:this.position.y},
				element.vertexBL,
				element.vertexBR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionTop(testCollision,element);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexTR,
				{x:this.position.x,y:this.position.y},
				element.vertexBL,
				element.vertexBR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionTop(testCollision,element);
				continue;
			}
		}

		//collision from avatar left
		if(currentMovement.x < 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTL,
				{x:this.position.x,y:this.position.y},
				element.vertexTR,
				element.vertexBR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionLeft(testCollision,element);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexBL,
				{x:this.position.x,y:this.position.y + this.size.y},
				element.vertexTR,
				element.vertexBR
			);
			
			if(testCollision !== false) {
				this.onElementCollisionLeft(testCollision,element);
				continue;
			}
		}

		//collision from avatar right
		if(currentMovement.x > 0) {
			testCollision = Physics.SegmentsCollision(
				this.vertexTR,
				{x:this.position.x + this.size.x,y:this.position.y},
				element.vertexTL,
				element.vertexBL
			);
			
			if(testCollision !== false) {
				this.onElementCollisionRight(testCollision,element);
				continue;
			}

			testCollision = Physics.SegmentsCollision(
				this.vertexBR,
				{x:this.position.x + this.size.x,y:this.position.y + this.size.y},
				element.vertexTL,
				element.vertexBL
			);
			
			if(testCollision !== false) {
				this.onElementCollisionRight(testCollision,element);
				continue;
			}
		}
	}
};


Element.prototype.isAttacking = function() {
	//todo
	return (
		!!this.attack && //if has attack 
		(this.lastAttack + this.attackRate > new Date().getTime()) //and attack in timer
	);
}

Element.prototype.updateAnimation = function() {
	if(this.oriented !== 'right' && this.oriented !== 'left') throw 'Unknow direction '+this.oriented;
	var classAnimation = null;

	if(this.isAttacking()) {
		classAnimation = this.dictClass['shooting_'+this.oriented];
	} else {
		switch(this.currentAction){
			case "fly":
				classAnimation = this.dictClass['flying_'+this.oriented];
				break;
			case "jump":
				classAnimation = this.dictClass['jumping_'+this.oriented];
				break;
			case "walk":
				classAnimation = this.dictClass['walking_'+this.oriented];
				break;
			default:
				classAnimation = this.dictClass['standing_'+this.oriented];
				break;
		}
	}

	this.domElem.className = classAnimation;
};

Element.prototype.onBlockCollision = function( collisionCoord, collisionElement ) {
	//stub
};

Element.prototype.onBlockCollisionBottom = function( collisionCoord, collisionElement ) {
	this.landedBlock = collisionElement;
	this.position.y = collisionCoord.y - this.size.y;
	this.velocity.y = 0;
	this.landed(collisionElement);
	this.onBlockCollision(collisionCoord, collisionElement );
};

Element.prototype.onBlockCollisionTop = function( collisionCoord, collisionElement ) {
	this.position.y = collisionCoord.y;
	this.velocity.y = 0;
	this.onBlockCollision(collisionCoord, collisionElement );
};

Element.prototype.onBlockCollisionLeft = function( collisionCoord, collisionElement ) {
	this.position.x = collisionCoord.x;
	this.velocity.x = 0;
	this.onBlockCollision(collisionCoord, collisionElement );
};

Element.prototype.onBlockCollisionRight = function( collisionCoord, collisionElement ) {
	this.position.x = collisionCoord.x - this.size.x;
	this.velocity.x = 0;
	this.onBlockCollision(collisionCoord, collisionElement );
};

Element.prototype.onAreaCollision = function() {
	//stub
},

Element.prototype.onAreaCollisionRight = function() {
	this.velocity.x = 0;
	this.onAreaCollision();
};

Element.prototype.onAreaCollisionTop = function() {
	this.velocity.y = 0;
	this.onAreaCollision();
};

Element.prototype.onAreaCollisionBottom = function() {
	this.velocity.y = 0;
	this.onAreaCollision();
	this.landed(false);
};

Element.prototype.onAreaCollisionLeft = function() {
	this.velocity.x = 0;
	this.onAreaCollision();
};

Element.prototype.onElementCollision = function(collisionCoord, collisionElement) {
	// collisionElement.destroy();
};

Element.prototype.onElementCollisionRight = function(collisionCoord, collisionElement) {
	this.onElementCollision(collisionCoord, collisionElement);
};

Element.prototype.onElementCollisionLeft = function(collisionCoord, collisionElement) {
	this.onElementCollision(collisionCoord, collisionElement);
};

Element.prototype.onElementCollisionTop = function(collisionCoord, collisionElement) {
	this.onElementCollision(collisionCoord, collisionElement);
};

Element.prototype.onElementCollisionBottom = function(collisionCoord, collisionElement) {
	this.onElementCollision(collisionCoord, collisionElement);
};

Element.prototype.onMove = function() {
	this.vertexTL.x = this.position.x;
	this.vertexTL.y = this.position.y;
	this.vertexBL.x = this.position.x;
	this.vertexBL.y = this.position.y + this.size.y;
	this.vertexTR.x = this.position.x + this.size.x;
	this.vertexTR.y = this.position.y;
	this.vertexBR.x = this.position.x + this.size.x;
	this.vertexBR.y = this.position.y + this.size.y;
};

Element.prototype.landed = function(element) {
	this.isLanded = true;
	this.landedBlock = element;
	this.onJustLand()
};

Element.prototype.unlanded = function() {
	this.isLanded = false;
	this.landedBlock = null;
	this.onUnland()
};

Element.prototype.onJustLand = function() {
	//stub
};

Element.prototype.onUnland = function() {
	//stub
};

module.exports = Element;