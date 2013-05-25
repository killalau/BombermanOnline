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
	var bmm = this.BMM;
	var bm = null;
	bm = bmm.getElementById(targetBM);
	
	bm.increaseBombNum();
	console.log('[Buff.applyBuff] classname:'+this.classname+' targetBM.id:'+bm.id+' targetBM.currentBombMax:'+bm.currentBombMax);
}

/*
@protected override method vanish()
*/
<<<<<<< HEAD
BMO.Buff.prototype.vanish = function(targetBM){
	var self = this;
	/*if targetBM = self BM
		applyBuff()
	  else
		do nothing...
	*/
	var playerId = self.BMM.wsClient.username;
	if (targetBM == playerId)
		self.applyBuff(targetBM);
	
=======
BMO.Buff.prototype.vanish = function(){
>>>>>>> 7d598df763e3220aecd3ed4d5539b3ec7070ffa1
	try{
	BMO.Element.prototype.vanish.call(this);	
	}catch(e){console.log("Buff.vanish:err=",e);throw e;};
}

BMO.Buff.prototype.eventProcesser = function(event){
	if (event.type === "vanish"){
		this.vanish();
	}
}