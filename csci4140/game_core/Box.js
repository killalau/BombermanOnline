var Element = require('./Element');
var Buff = require('./Buff');

Box.prototype = new Element.Element();
Box.prototype.constructor = Box;
function Box(grid, buffName){
	Element.Element.call(this, grid);
	this.classname = "Box";
	this.buff = buffName;
	
	this.isBlockable = true;
}

Box.prototype.vanish = function(){
	var newBuff = Buff.Builder(this.grid, this.buff);
	this.grid.removeElement(this);
}

exports.Box = Box;