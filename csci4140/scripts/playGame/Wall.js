var BMO = window.BMO ? window.BMO : {};

/*
@class: Wall
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.Wall =function(_grid,_BMM,_wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM,_wsClient);
	this.classname = "Wall";
	this.isBlockable = true;
	}catch(e){throw e;};
}

//constructor
BMO.Wall.construtor = BMO.Wall;
BMO.Wall.prototype = Object.create( BMO.Element.prototype );