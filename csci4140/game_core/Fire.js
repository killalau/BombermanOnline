var Element = require('./Element');

Fire.prototype = new Element.Element();
Fire.prototype.constructor = Fire;
function Fire(grid){
	Element.Element.call(this, grid);
	this.classname = "Fire";
}

Fire.prototype.vanish = function(){
	//this.grid.removeElement(this);
	Element.prototype.vanish.call(this);
}

exports.Fire = Fire;