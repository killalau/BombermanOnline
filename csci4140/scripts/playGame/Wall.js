var BMO = window.BMO ? window.BMO : {};

/*
@class: Wall
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.Wall =function(_grid,_BMM,wsClient){
	BMO.Element.call(this,_grid,_BMM);
	this.wsClient = wsClient;
}

//constructor
BMO.Wall.construtor = BMO.Wall;
BMO.Wall.prototype = Object.create( BMO.Element.prototype );