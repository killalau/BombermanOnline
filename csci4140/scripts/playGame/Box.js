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
@param e = None or Buff.classname;
**/
BMO.Box.prototype.vanish = function(payload){
	try{
	if (this.isDestroyable){
		var self = this;
		
		self.setView("box_fire1");
		setTimeout(function(){
			self.setView("box_fire2");
			setTimeout(function(){
				var _buff = null;
				var _grid = null;
				if (payload !== "None" ){
					_grid = self.grid;
					/*
						switch payload{
							case 'BombPlusPlus':
							case 'SpeedPlusPlus':
							case 'FirePlusPlus':
							default:
						}
					*/
					_buff = new BMO.BombPlusPlus(_grid,self.BMM,self.wsClient);//AndyQ - to be changed
				}
				self.wsClient= null;
				BMO.Element.prototype.vanish.call(self);
				if ( _buff !== null ){
					_buff.setView(payload);
					_grid.addElement(_buff);
					_grid.view.addChild(_buff.view);
				}
			},300);
		},300);
	}
	}catch(e){console.error("Box.vanish:err=",e);throw e;};
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
		/*
		payload=null or classname
		**/
		this.vanish(event.payload);
	}
}