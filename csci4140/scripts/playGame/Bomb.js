var BMO = window.BMO ? window.BMO : {};

/*
@class: Bomb
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.Bomb =function(_grid,_BMM,wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM);
	this.wsClient = wsClient;
	}catch(e){throw e;};
}

//constructor
BMO.Bomb.construtor = BMO.Bomb;
BMO.Bomb.prototype = Object.create( BMO.Element.prototype );