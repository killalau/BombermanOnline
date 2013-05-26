var BMO = window.BMO ? window.BMO : {};

BMO.SpeedPlusPlus = function(_grid, _BMM, _wsClient){
	try{
	BMO.Buff.call(this,_grid,_BMM,_wsClient);
	this.classname = "SpeedPlusPlus";
	}catch(e){throw e;};
}

//constructor
//BMO.SpeedPlusPlus.construtor = BMO.SpeedPlusPlus;
//inherit Buff
BMO.SpeedPlusPlus.prototype = Object.create( BMO.Buff.prototype );

/*
@public inherited method Buff.setView()
@param _id: frame_id in .json
**/
BMO.SpeedPlusPlus.prototype.setView = function(_id){
	BMO.Buff.prototype.setView.call(this,_id);//super.setView()....
}

//@protected method applyBuff()
//to apply the funciton of the buff to self BM
BMO.SpeedPlusPlus.prototype.applyBuff = function(targetBM){
	var bmm = this.BMM;
	var playerId = bmm.wsClient.username;
	
	try{
	console.log('[SpeedPlusPlus.applyBuff] targetBM:'+targetBM+' playerId:'+playerId);
	if (targetBM == playerId){
		var bm = bmm.getElementById(targetBM);
		bm.increaseSpeed();
		console.log('[SpeedPlusPlus.applyBuff] classname:'+this.classname+' targetBM.id:'+bm.id+' targetBM.currentBombMax:'+bm.currentBombMax);
		this.vanish();
	}
	}catch(e){console.log("SpeedPlusPlus.applyBuff:err=",e);throw e;};
}

/*
@private inherited method Buff.vanish()
*/
BMO.SpeedPlusPlus.prototype.vanish = function(){
	BMO.Buff.prototype.vanish.call(this);
}

/*
@public inherited method Buff.eventProcesser()
*/
/*
 *	var e ={
 *			type: "explode",
 *			payload: _in.payload
 *	}
 */
BMO.SpeedPlusPlus.prototype.eventProcesser = function(event){
	BMO.Buff.prototype.eventProcesser.call(this,event);
}