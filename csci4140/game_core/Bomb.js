var Element = require('./Element');

Bomb.prototype = new Element.Element();
Bomb.prototype.constructor = Bomb;
function Bomb(grid){
	Element.Element.call(this, grid);
	this.classname = "Bomb";
	
	this.isBlockable = true;
}

Bomb.prototype.vanish = function(){
	this.grid.removeElement(this);
}

exports.Bomb = Bomb;