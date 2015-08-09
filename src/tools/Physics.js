var Vector = require('./Vector');

var Physics = {};

//Fourth params are Vector
Physics.SegmentsCollision = function(a1,a2,b1,b2) {

	intersection = Vector.Zero();

	var b = Vector.Sub(a2,a1);
	var d = Vector.Sub(b2,b1);
	var bDotDPerp = b.x * d.y - b.y * d.x;

	// if b dot d == 0, it means the lines are parallel so have infinite intersection points
	if (bDotDPerp == 0)
	return false;

	var c = Vector.Sub(b1,a1);
	var t = (c.x * d.y - c.y * d.x) / bDotDPerp;

	if (t < 0 || t > 1) return false;

	var u = (c.x * b.y - c.y * b.x) / bDotDPerp;
	if (u < 0 || u > 1) return false;
	b.scalar(t);
	return Vector.Sum(a1, b);

}

/**
 * @param position      Vector  position at t0
 * @param velocity      Vector  
 * @param force         Vector  sum of all force applied 
 * @param dt            Numeric timestep
 *
 * @return  Vector  new position at t0 + dt
 *
 * equation : position = vitesse * dt + 0.5 * force * dt²
 */
Physics.MotionIntegration = function(position,velocity,force,dt) {
	var v = velocity.duplicate();
	v.scalar(dt);
	
	var a = force.duplicate();
	a.scalar(0.5 * dt * dt);
	
	return Vector.Sum( position.duplicate(), Vector.Sum( v, a ) );
}

/**
 * @param position      Vector
 * @param velocity      Vector  
 * @param force         Vector
 * @param dt            Numeric timestep
 * @return Object {dx:dx,dv:dv}
 *
 * equation : position = vitesse * dt + 0.5 * force * dt²
 */
Physics.integrateKM4 = function(position, velocity, force, dt) {

	var a = _evaluateMK4( velocity, force, 0.0,    new _state() );
	var b = _evaluateMK4( velocity, force, dt*0.5, a );
	var c = _evaluateMK4( velocity, force, dt*0.5, b );
	var d = _evaluateMK4( velocity, force, dt,      c );
	var output = {};
	output['dx'] = Vector.Scalar(
		Vector.Sum(
			a.position,
			Vector.Sum(
				Vector.Scalar(
					Vector.Sum(
						b.position, 
						c.position
					),
					2
				),
				d.position
			)
		),
		dt * 0.166666666667 
	);
	output['dv'] = Vector.Scalar(
		Vector.Sum(
			a.velocity,
			Vector.Sum(
				Vector.Scalar(
					Vector.Sum(
						b.velocity,
						c.velocity
					),
					2
				),
				d.velocity
			)
		),
		dt * 0.166666666667
	);

	return output;
}

var _evaluateMK4 = function ( velocity, force, dt, derivate ) {
	var output = new _state();
	var deriv = derivate.velocity.duplicate();
	deriv.scalar(dt);
	output.position = Vector.Sum(velocity, deriv);
	output.velocity = force;
	return output;
}

var _state = function () {
	this.position = new Vector(0,0);
	this.velocity = new Vector(0,0);
}

module.exports = Physics;