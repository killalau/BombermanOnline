var Element = require('./Element');

Fire.prototype = new Element.Element();
Fire.prototype.constructor = Fire;
function Fire(grid){
	Element.Element.call(this, grid);
	this.classname = "Fire";
	var self = this;
	setTimeout(function(){self.vanish();},5);
}

/*
@public override method vanish
**/
Fire.prototype.vanish = function(){
	try{
	Element.Element.prototype.vanish.call(this);
	}catch(e){console.log("Fire.vanish:err=",e);};
}

exports.Fire = Fire;