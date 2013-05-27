var Element = require('./Element');

BM.prototype = new Element.Element();
BM.prototype.constructor = BM;
function BM(gClient, grid){
	Element.Element.call(this, grid);
	this.classname = "BM";
	this.gClient = gClient;
	this.id = gClient ? gClient.username : "NPC";
	this.alive = true;
	//below attributes are overriden by map's config
	this.bombNum = 1;
	this.bombCurrentMax = 1;
	this.bombMax = 8;
	this.power = 2;
	this.powerMax = 8;

	this.speed = 0.1;			//grid per 30ms
	this.speedMax = 0.8;
}

BM.prototype.initialize = function(){
	Element.Element.initialize.call(this);
}

BM.prototype.canPlace = function(){
	return true;
}

BM.prototype.increaseBombNum = function(num){
	num = num ? parseInt(num) : 1;
	this.bombNum += num;
	if(this.bombNum > this.bombCurrentMax) this.bombNum = this.bombCurrentMax;
	if(this.bombNum < 0) this.bombNum = 0;
}

BM.prototype.increaseBombCurrentMax = function(num){
	num = num ? parseInt(num) : 1;
	if(this.bombCurrentMax + num > this.bombMax){
		num = this.bombMax - this.bombCurrentMax;
	}
	this.bombNum += num;
	this.bombCurrentMax += num;
	if(this.bombNum < 0) this.bombNum = 0;
	if(this.bombCurrentMax < 0) this.bombCurrentMax = 0;
	console.log('[BM.increaseBombCurrentMax] bombCurrentMax:'+this.bombCurrentMax);
}

BM.prototype.increaseSpeed = function(num){
	num = num ? parseInt(num) : 0.025;
	this.speed += num;
	if (this.speed > this.speedMax) this.speed = this.speedMax;
	if (this.speed < 0.05) this.speed = 0.05;
}

BM.prototype.increasePower = function(num){
	num = num ? parseInt(num) : 1;
	this.power += num;
	if(this.power > this.powerMax) this.power = this.powerMax;
	if(this.power < 0) this.power = 0;
}

/*
@public override method vanish
**/
BM.prototype.vanish = function(){
	try{
		if (this.isDestroyable){
			this.isDestroyable = false;
			this.alive=false;
			Element.Element.prototype.vanish.call(this);
		}
	}catch(e){console.log("BM.vanish:err=",e);};
}

exports.BM = BM;