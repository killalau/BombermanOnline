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
	try{
	var newBuff = Buff.Builder(this.grid, this.buff);
	Element.Element.prototype.vanish.call(this);
	}catch(e){console.log("Box.vanish:err=",e);};
}

exports.Box = Box;