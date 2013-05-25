var Wall = require("./Wall");
var Element = require("./Element");
var Box = require("./Box");
var BM = require("./BM");
var Bomb = require("./Bomb");
var Buff = require('./Buff');

function Grid(BMM, position){
	this.classname = "Grid";
	this.BMM = BMM;
	this.position = position;
	this.elementList = [];
	
	//BMM.setGrid(this, position);
}

Grid.prototype.initialize = function(){

}

Grid.prototype.addElement = function(element){
	if(element == null) return;
	this.elementList.push(element);
	element.grid = this;
	//this.BMM.elementList.push(element);
}

Grid.prototype.removeElement = function(element){
	if(element == null) return;
	for(var i = 0, e; e = this.elementList[i]; i++){
		if(e === element){
			this.elementList.splice(i, 1);
			break;
		}
	}
	element.grid = null;
	/*
	for(var i = 0, e; e = this.BMM.elementList[i]; i++){
		if(e === element){
			this.BMM.elementList.splice(i, 1);
			break;
		}
	}*/
}

Grid.prototype.getGridList = function(){
	return this.BMM.gridList;
}

/*
Grid.prototype.getElementById = function(classname){
	for(var i = 0, e; e = this.elementList[i]; i++){
		if(e.classname == classname){
			return e;
		}
	}
	return null;
}*/

Grid.prototype.getElementByClass = function(classname){
	for(var i = 0, e; e = this.elementList[i]; i++){
		switch(classname){
		case "Box":
			if ( e instanceof Box.Box ) return e;
			break;
		case "BM":
			if ( e instanceof BM.BM ) return e;
			break;
		case "Buff":
			if ( e instanceof Buff.Buff ) return e;
			break;
		case "Bomb":
			if ( e instanceof Bomb.Bomb ) return e;
			break;
		case "Fire":
			if ( e instanceof Fire.Fire ) return e;
			break;
		case "Wall":
			if ( e instanceof Wall.Wall ) return e;
			break;			
		}
	}
	return null;
}

Grid.prototype.isBlockable = function(){
	for(var i = 0, e; e = this.elementList[i]; i++){
		if(e.isBlockable)
			return true;
	}
	return false;
}

Grid.prototype.vanish = function(){
	for(var i = 0, e; e = this.elementList[i]; i++){
		e.vanish();
	}
}

exports.Grid = Grid;