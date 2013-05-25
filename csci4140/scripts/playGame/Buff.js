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
	var playerId = bmm.wsClient.username;
	
	try{
	console.log('[Buff.applyBuff] targetBM:'+targetBM+' playerId:'+playerId);
	if (targetBM == playerId){
		var bm = bmm.getElementById(targetBM);
		bm.increaseBombNum();
		console.log('[Buff.applyBuff] classname:'+this.classname+' targetBM.id:'+bm.id+' targetBM.currentBombMax:'+bm.currentBombMax);
		this.vanish();
	}
	}catch(e){console.log("Buff.applyBuff:err=",e);throw e;};
}

/*
@protected override method vanish()
*/
BMO.Buff.prototype.vanish = function(){
	try{
		if (this.isDestroyable)
			BMO.Element.prototype.vanish.call(this);	
	}catch(e){console.log("Buff.vanish:err=",e);throw e;};
}

/*
 *	var e ={
 *			type: "explode",
 *			payload: _in.payload
 *	}
 */
BMO.Buff.prototype.eventProcesser = function(event){
	console.log('[Buff.eventProcesser]');
	if (event.type == "vanish"){
		console.log('[Buff.eventProcesser] vanish');
		this.vanish();
	}else if(event.type == "applyBuff"){
		console.log('[Buff.eventProcesser] applyBuff');
		this.applyBuff(event.payload);
	}
}