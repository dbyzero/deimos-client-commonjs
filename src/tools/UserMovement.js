var lastId = 0;

var UserMovement = function (force, type) {
	this.id = lastId++;
	this.movement = force;
	this.startTimestamp = new Date().getTime();
	this.durationIntegrated = 0;
	this.duration = null;
	this.type = type;
}

module.exports = UserMovement ;