var Loop = function(delay,ttl) {
	this.active = false ;
	this.loopId = null ;
	this.delay = delay ;
	this.ttl = ttl || 0 ;
	this.lastUpdate = 0 ;
};

Loop.prototype.start = function(loopedFunction) {
	this.active = true ;
	loopedFunction.bind(this) ;

	//loopiiiing
	(function loop(){
		loopedFunction();
		this.loopId = setTimeout(loop.bind(this),this.delay) ;
	}).call(this) ;

	//ttl manage
	if(this.ttl > 0) {
		var safeFunction = function(){
			if(this.active) {
				console.debug('TTL reach');
				this.stop();
			}
		} ;
		setTimeout(safeFunction.bind(this),this.ttl) ;
	}
};


Loop.prototype.stop = function() {
	this.active = false ;
	clearTimeout(this.loopId) ;
}

module.exports = Loop;