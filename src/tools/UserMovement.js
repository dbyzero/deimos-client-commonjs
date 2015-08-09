var UserMovement = function (id, type, start, force) {
	this.id = id;
	this.movement = force;
	this.startTimestamp = start;
	this.durationIntegrated = 0;
	this.duration = null;
	this.type = type;
}

// UserMovement.lastid = 0;


module.exports = UserMovement ;