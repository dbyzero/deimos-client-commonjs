Vector = function(x,y) {
	this.x = x ;
	this.y = y ;
}

Vector.Zero = function() {
	return new Vector(0,0);
}

Vector.Sum = function(vector1,vector2) {
	return new Vector(parseFloat(vector1.x) + parseFloat(vector2.x), parseFloat(vector1.y) + parseFloat(vector2.y)) ;
}

Vector.Sub = function(vector1,vector2) {
	return new Vector(parseFloat(vector1.x) - parseFloat(vector2.x), parseFloat(vector1.y) - parseFloat(vector2.y)) ;
}

Vector.Dot = function(vector1,vector2) {
	return new Vector(parseFloat(vector1.x) * parseFloat(vector2.x), parseFloat(vector1.y) * parseFloat(vector2.y)) ;
}

Vector.Scalar = function(vector1,scal) {
	return new Vector(parseFloat(vector1.x) * scal, parseFloat(vector1.y) * scal) ;
}

Vector.prototype.add = function(vectorToAdd) {
	this.x = vectorToAdd.x + this.x ;
	this.y = vectorToAdd.y + this.y ;
}

Vector.prototype.sub = function(vectorToAdd) {
	this.x = vectorToAdd.x - this.x ;
	this.y = vectorToAdd.y - this.y ;
}

Vector.prototype.dot = function(vec_) {
	this.x = vec_.x * this.x ; 
	this.y = vec_.y * this.y ;
}

Vector.prototype.scalar = function(scal) {
	this.x = scal * this.x ;
	this.y = scal * this.y ;
}

Vector.prototype.duplicate = function() {
	return new Vector(this.x,this.y) ;
}

Vector.prototype.lengthSquare = function() {
	return (this.x*this.x + this.y*this.y) ;
}

//if possible, prefeatr lengthSquare who is faster
Vector.prototype.length = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y) ;
}

Vector.prototype.toString = function() {
	return this.x+"x"+this.y;
}

module.exports = Vector;