var BMO = window.BMO ? window.BMO : {};

BMO.BombPlusPlus = function(_grid, _BMM, _wsClient){
	try{
	BMO.Element.call(this,_grid,_BMM,_wsClient);
	this.classname = "BombPlusPlus";
	this.ownerBM = null;
	}catch(e){throw e;};
}

//constructor
//BMO.Buff.construtor = BMO.Buff;
//inherit Element
BMO.BombPlusPlus.prototype = Object.create( BMO.Element.prototype );

/*
@public override method setView
@param _id: frame_id in .json
**/
BMO.BombPlusPlus.prototype.setView = function(_id){
	BMO.Element.prototype.setView.call(this,_id);//super.setView()....
}

//@protected method applyBuff()
//to apply the funciton of the buff to self BM
BMO.BombPlusPlus.prototype.applyBuff = function(targetBM){	
	var bmm = this.BMM;
	var playerId = bmm.wsClient.username;
	
	try{
	console.log('[BombPlusPlus.applyBuff] targetBM:'+targetBM+' playerId:'+playerId);
	if (targetBM == playerId){
		var bm = bmm.getElementById(targetBM);
		bm.increaseBombNum();
		console.log('[BombPlusPlus.applyBuff] classname:'+this.classname+' targetBM.id:'+bm.id+' targetBM.currentBombMax:'+bm.currentBombMax);
		this.vanish();
	}
	}catch(e){console.log("BombPlusPlus.applyBuff:err=",e);throw e;};
}

/*
@private inherited method vanish()
*/
BMO.BombPlusPlus.prototype.vanish = function(){
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
BMO.BombPlusPlus.prototype.eventProcesser = function(event){
	console.log('[Buff.eventProcesser]');
	if (event.type == "vanish"){
		console.log('[Buff.eventProcesser] vanish');
		this.vanish();
	}else if(event.type == "applyBuff"){
		console.log('[Buff.eventProcesser] applyBuff');
		this.applyBuff(event.payload);
	}
}