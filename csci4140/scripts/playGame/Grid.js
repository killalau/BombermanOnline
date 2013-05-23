var BMO = window.BMO ? window.BMO : {};
/*
@class Grid
@constructor
@param X: X ? index of row in 2 D Array : 0
@param Y: Y ? index of col in 2 D Array : 0
@param _BMM: BMM 
**/
BMO.Grid = function(x,y,_BMM){
	
	try{
		x = x ? x : 0;
		y = y ? y : 0;
		this.elementList = [];
		this.view = new PIXI.DisplayObjectContainer();
		this.view.position.x = x*48;
		this.view.position.y = y*48;
		this.X = x;
		this.Y = y;
		this.BMM = _BMM;
	}catch(e){
		throw e;
	}
}

//Constructor
BMO.Grid.constructor = BMO.Grid;
//BMO.Grid.prototype = Object.create(BMO.Grid.prototype);

BMO.Grid.prototype.addElement = function(element){
	element.grid.removeElement(element);
	this.elementList.push(element);
	element.grid = this;
}

BMO.Grid.prototype.removeElement = function(element){
	for(var i = 0; i < this.elementList.length; i++){
		if(this.elementList[i] === element){
			this.elementList.splice(i, 1);
			break;
		}
	}
}

BMO.Grid.prototype.isBlockable = function(){
	for(var i = 0, e; e = this.elementList[i]; i++){
		if(e.isBlockable)
			return true;
	}
	return false;
}