var Element = require('./Element');

Buff.prototype = new Element.Element();
Buff.prototype.constructor = Buff;
function Buff(grid, buff){
	buff = buff ? buff : "Buff";
	Element.Element.call(this, grid);
	this.classname = buff;
	this.buff = buff;
}

Buff.prototype.vanish = function(){
	this.grid.removeElement(this);
}

Buff.prototype.applyBuff = function(BM){

}

BombPlusPlus.prototype = new Buff();
BombPlusPlus.prototype.constructor = BombPlusPlus;
function BombPlusPlus(grid, buff){
	Buff.call(this, grid, buff);
}

BombPlusPlus.prototype.applyBuff = function(BM){
	BM.increaseBombCurrentMax();
}

FirePlusPlus.prototype = new Buff();
FirePlusPlus.prototype.constructor = FirePlusPlus;
function FirePlusPlus(grid, buff){
	Buff.call(this, grid, buff);
}

FirePlusPlus.prototype.applyBuff = function(BM){
	BM.increasePower();
}

SpeedPlusPlus.prototype = new Buff();
SpeedPlusPlus.prototype.constructor = SpeedPlusPlus;
function SpeedPlusPlus(grid, buff){
	Buff.call(this, grid, buff);
}

SpeedPlusPlus.prototype.applyBuff = function(BM){
	BM.increaseSpeed();
}

function Builder(grid, buff){
	var newBuff = null;
	if(buff == "BombPlusPlus"){
		newBuff = new BombPlusPlus(grid, buff);
	}else if(buff == "FirePlusPlus"){
		newBuff = new FirePlusPlus(grid, buff);
	}else if(buff == "SpeedPlusPlus"){
		newBuff = new SpeedPlusPlus(grid, buff);
	}
	return newBuff;
}

exports.Buff = Buff;
exports.Builder = Builder;