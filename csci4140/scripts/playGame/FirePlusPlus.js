var BMO = window.BMO ? window.BMO : {};

BMO.FirePlusPlus = function(_grid, _BMM, _wsClient){
	console.log('[FirePlusPlus]');
	try{
	BMO.Buff.call(this,_grid,_BMM,_wsClient);
	this.classname = "FirePlusPlus";
	}catch(e){throw e;};
}

//constructor
//BMO.FirePlusPlus.construtor = BMO.FirePlusPlus;
//inherit Buff
BMO.FirePlusPlus.prototype = Object.create( BMO.Buff.prototype );

/*
@public inherited method Buff.setView()
@param _id: frame_id in .json
**/
BMO.FirePlusPlus.prototype.setView = function(_id){
	BMO.Buff.prototype.setView.call(this,_id);//super.setView()....
}

//@protected method applyBuff()
//to apply the funciton of the buff to self BM
BMO.FirePlusPlus.prototype.applyBuff = function(targetBM){
	var bmm = this.BMM;
	var playerId = bmm.wsClient.username;
	
	try{
	console.log('[FirePlusPlus.applyBuff] targetBM:'+targetBM+' playerId:'+playerId);
	if (targetBM == playerId){
		var bm = bmm.getElementById(playerId);
		bm.increasePower();
		console.log('[FirePlusPlus.applyBuff] classname:'+this.classname+' targetBM.id:'+bm.id+' targetBM.powerOfFire:'+bm.powerOfFire);
	}
	this.vanish();
	}catch(e){console.log("FirePlusPlus.applyBuff:err=",e);throw e;};
}

/*
@private inherited method Buff.vanish()
*/
BMO.FirePlusPlus.prototype.vanish = function(){
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
BMO.FirePlusPlus.prototype.eventProcesser = function(event){
	BMO.Buff.prototype.eventProcesser.call(this,event);
}