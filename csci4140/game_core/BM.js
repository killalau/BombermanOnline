var Element = require('./Element');

BM.prototype = new Element.Element();
BM.prototype.constructor = BM;
BM.prototype.parent = Element.Element.prototype;
function BM(gClient, grid){
	this.parent.constructor.call(this, grid);
	this.classname = "BM";
	this.gClient = gClient;
	this.id = gClient.username;
	this.bombNum = 1;
	this.bombCurrentMax = 1;
	this.bombMax = 8;
	this.power = 2;
	this.powerMax = 8;
	
	//"override" attributes
	this.speed = 4;
	this.speedMax = 20;
}

BM.prototype.initialize = function(){
	this.parent.initialize.call(this);
}

BM.prototype.canPlace(){
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
}

BM.prototype.increasePower = function(num){
	num = num ? parseInt(num) : 1;
	this.power += num;
	if(this.power > this.powerMax) this.power = this.powerMax;
	if(this.power < 0) this.power = 0;
}

exports.BM = BM;