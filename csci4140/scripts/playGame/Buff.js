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
BMO.Buff.prototype.vanish = function(targetBM){
	var self = this;
	/*if targetBM = self BM
		applyBuff()
	  else
		do nothing...
	*/
	try{
	console.log('[Buff.vanish] vanish');
	BMO.Element.prototype.vanish.call(self);
	self.wsClient= null;
	}catch(e){console.log(e);throw e;};
}

BMO.Buff.prototype.eventProcesser = function(event){
	if (event.type === "vanish"){
		//console.log("Bomb.explode:",event);
		this.vanish(event.payload);
	}
}