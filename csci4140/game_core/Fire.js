var Element = require('./Element');

Fire.prototype = new Element.Element();
Fire.prototype.constructor = Fire;
function Fire(grid){
	Element.Element.call(this, grid);
	this.classname = "Fire";
	var self = this;
	setTimeout(function(){self.vanish();},10);
}

/*
@public override method vanish
**/
Fire.prototype.vanish = function(){
	try{
	if (this.isDestroyable){
		this.isDestroyable = false;
		var _grid = this.grid;
		var _elementList = [];
		Element.Element.prototype.vanish.call(this);
		for (var i=0;i<_grid.elementList.length;i++) _elementList.push(_grid.elementList[i]); //COPY list but not reference list
		for (var i=0;i<_elementList.length;i++) _elementList[i].vanish();
		//console.log("Fire.vanish:_grid position",_grid.position,"_grid.elementList=",_grid.elementList);
	}
	}catch(e){console.log("Fire.vanish:err=",e);};
}

exports.Fire = Fire;