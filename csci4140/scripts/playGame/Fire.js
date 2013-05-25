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
	this.fireID = null;	
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
	this.fireID = _id;
}

/*
@protected override method vanish()
@param payload = null or {type:..,extra:..}
**/
BMO.Fire.prototype.vanish = function(payload){
	try{
	//{type:"Box",extra:_object.buff}
	//{type:"Buff",extra:null}
	//{type:"BM",extra:idList}
	if (this.isDestroyable){
		this.isDestroyable = false;
		var self = this;
		setTimeout(function(){		
			BMO.Element.prototype.setView.call(self,self.fireID+"1");		
			var _grid = self.grid;
			self.isDestroyable = true;
			BMO.Element.prototype.vanish.call(self);
			self.wsClient= null;
			if ( payload !== null ){
				var _elementList = [];
				for(var i in _grid.elementList) _elementList.push(_grid.elementList[i]);//COPY
				for(var i = 0 ; i < _elementList.length; i++)
					_elementList[i].eventProcesser({type:"vanish",payload:payload.extra});			
			} 
		},200);	
	}	
	}catch(e){console.error("Fire.vanish:err=",e);throw e;};
}

/*
@public method eventProcesser
@param event: event object
		var event ={
			type: "",
			payload: ""
		}
**/
BMO.Fire.prototype.eventProcesser = function(event){
	if (event.type === "vanish"){
		//console.log("Bomb.explode:",event);
		/*
		payload = null or {type:..,extra:..}
		**/
		this.vanish(event.payload);
	}
}