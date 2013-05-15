BMO.Buff.prototype.vanish = function(){//Andy
	try{
	BMO.Element.prototype.vanish.call(this);
	this.BM = null;
	this.wsClient= null;
	if(this.waitFunc != null){
		clearInterval(this.waitFunc);
		this.waitFunc = null;
	}
	}catch(e){console.log(e);throw e;};
}


BMO.Buff.prototype.eventProcesser = function(event){//Andy
	if (event.type === "vanish"){
		//console.log("Bomb.explode:",event);
		this.vanish();
	}
}