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

Grid.prototype.getElementById = function(classname){
	for(var i = 0, e; e = this.elementList[i]; i++){
		if(e.classname == classname){
			return e;
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