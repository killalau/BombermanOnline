var BMO = window.BMO ? window.BMO : {};

/*
@class: Box
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.Box =function(_grid,_BMM,_wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM,_wsClient);
	this.classname = "Box";
	this.isBlockable = true;
	}catch(e){throw e;};
}

//constructor
BMO.Box.construtor = BMO.Box;
BMO.Box.prototype = Object.create( BMO.Element.prototype );

/*
@public override method setView
@param _id: frame_id in .json
**/
BMO.Box.prototype.setView = function(_id){
	BMO.Element.prototype.setView.call(this,_id);//super.setView()....
}

/*
@protected override method vanish()
**/
BMO.Box.prototype.vanish = function(){
	try{
	this.wsClient= null;
	var self = this;
	
	self.setView("box_fire1");
	setTimeout(function(){
		self.setView("box_fire2");
		setTimeout(function(){
			//DoMore
			BMO.Element.prototype.vanish.call(self);
		},300);
	},300);
	
	}catch(e){console.log(e);throw e;};
}

/*
@public method eventProcesser
@param event: event object
		var event ={
			type: "",
			payload: ""
		}
**/
BMO.Box.prototype.eventProcesser = function(event){
	if (event.type === "vanish"){
		//console.log("Bomb.explode:",event);
		this.vanish();
	}
}