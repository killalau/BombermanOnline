var BMO = window.BMO ? window.BMO : {};

/*
@class: Fire
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.Fire =function(_grid,_BMM,_wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM,_wsClient);
	this.classname = "Fire";
	}catch(e){throw e;};
}

//constructor
BMO.Fire.construtor = BMO.Fire;
BMO.Fire.prototype = Object.create( BMO.Element.prototype );

/*
@public overrid method setView
@param _id: frame_id in .json
**/
BMO.Fire.prototype.setView = function(_id){
	BMO.Element.prototype.setView.call(this,_id);//super.setView()....
	var self = this;
	setTimeout(function(){
		//console.log(_id+"1");
		BMO.Element.prototype.setView.call(self,_id+"1");
		setTimeout(function(){self.vanish();},200);
	},200);
}

/*
@protected override method vanish()
**/
BMO.Fire.prototype.vanish = function(){
        try{
        BMO.Element.prototype.vanish.call(this);
        this.wsClient= null;
        }catch(e){console.log(e);throw e;};
}
