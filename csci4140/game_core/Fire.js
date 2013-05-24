var Element = require('./Element');

Fire.prototype = new Element.Element();
Fire.prototype.constructor = Fire;
function Fire(grid){
	Element.Element.call(this, grid);
	this.classname = "Fire";
}

exports.Fire = Fire;