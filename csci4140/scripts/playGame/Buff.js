var BMO = window.BMO ? window.BMO : {};

BMO.Buff = function(_grid, _BMM, _wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM,_wsClient);
	//this.classname = 'Buff';
	this.classname = "BombPlusPlus";
	this.ownerBM = null;
	}catch(e){throw e;};
}

//constructor
//BMO.Buff.construtor = BMO.Buff;
//inherit Element
BMO.Buff.prototype = Object.create( BMO.Element.prototype );

/*
@public override method setView
@param _id: frame_id in .json
**/
BMO.Buff.prototype.setView = function(_id){
	BMO.Element.prototype.setView.call(this,_id);//super.setView()....
}

//@protected method applyBuff()
//to apply the funciton of the buff to self BM
BMO.Buff.prototype.applyBuff = function(targetBM){
//applybuff
//AndyQ - how to change myself's BM's property?
}

/*
@protected override method vanish()
*/
BMO.Buff.prototype.vanish = function(){
	try{
	var self = this;
	//OK I borrow the box_fire explode
	self.setView("box_fire1");
	setTimeout(function(){
		self.setView("box_fire2");
		setTimeout(function(){
			BMO.Element.prototype.vanish.call(self);
		},100);
	},100);
	
	}catch(e){console.log("Buff.vanish:err=",e);throw e;};
}

BMO.Buff.prototype.eventProcesser = function(event){
	if (event.type === "vanish"){
		this.vanish();
	}
}