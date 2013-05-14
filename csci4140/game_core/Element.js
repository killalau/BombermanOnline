function Element(grid){
	this.classname = "Element";
	this.grid = grid;
	this.isBlockable = false;
	this.position = {x : 0, y : 0};
	this.speed = 0;			//grid per 30ms
	this.speedMax = 0;
	this.direction = 'D';
	this.moving = 0;
	this.moveFunction = null;
	
	if(grid) this.grid.addElement(this);
}

Element.prototype.initialize = function (){
	
}

Element.prototype.canMove = function(){
	return true;
}

Element.prototype.move = function(){
	
}

Element.prototype.setDirection = function(dir){
	this.direction = dir;
}

Element.prototype.moveStart = function(){

}

Element.prototype.moveStop = function(){

}

Element.prototype.increaseSpeed = function(num){
	num = num ? parseInt(num) : 0.05;
	this.speed += num;
	if(this.speed > this.speedMax) this.speed = this.speedMax;
	if(this.speed < 0) this.speed = 0;
}

Element.prototype.vanish = function(){

}

exports.Element = Element;