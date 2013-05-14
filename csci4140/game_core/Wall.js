var Element = require('./Element');

Wall.prototype = new Element.Element();
Wall.prototype.constructor = Wall;
function Wall(grid){
	Element.Element.call(this, grid);
	this.classname = "Wall";
	
	this.isBlockable = true;
}

exports.Wall = Wall;