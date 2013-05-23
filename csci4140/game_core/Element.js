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

Element.prototype.canMove = function(grid){
	return !grid.isBlockable();
}

Element.prototype.move = function(dest_row,dest_col){
	var dest_grid = this.grid.BMM.gridList[dest_row][dest_col];
	switch (this.direction){
	case "U":
		this.position.y -= this.speed;
		if(this.position.y <= -0.5){
			changeGrid(this, dest_grid, "y", 1);
		}
		break;
	case "D":
		this.position.y += this.speed;
		if(this.position.y >= 0.5){
			changeGrid(this, dest_grid, "y", -1);
		}
		break;
	case "L":
		this.position.x -= this.speed;
		if(this.position.x <= -0.5){
			changeGrid(this, dest_grid, "x", 1);
		}
		break;
	case "R":
		this.position.x += this.speed;
		if(this.position.x >= 0.5){
			changeGrid(this, dest_grid, "x", -1);
		}
		break;		
	}
	
	function changeGrid(self, dest_grid, dir, v){
		if(self.canMove(dest_grid)){
			self.position[dir] += v;
			self.grid.removeElement(self);
			dest_grid.addElement(self);
		}else{
			self.position[dir] += self.speed * v;
		}
	}
}

Element.prototype.setDirection = function(dir){
	this.direction = dir;
}

Element.prototype.moveStart = function(){
	if(this.moveFunction != null){
		return;
	}
	var self = this;
	this.moveFunction = setInterval(function(){
		return function(){
			var gy, gx;
			switch(self.direction){
			case "U":
				gy = self.grid.position.y-1;
				gx = self.grid.position.x;
				break;
			case "D":
				gy = self.grid.position.y+1;
				gx = self.grid.position.x;
				break;
			case "L":
				gy = self.grid.position.y;
				gx = self.grid.position.x-1;
				break;
			case "R":
				gy = self.grid.position.y;
				gx = self.grid.position.x+1;
				break;
			}
			self.move(gy,gx);
		};
	}(), 30);
}

Element.prototype.moveStop = function(){
	clearInterval(this.moveFunction);
	this.moveFunction = null;
}

Element.prototype.increaseSpeed = function(num){
	num = num ? parseInt(num) : 0.05;
	this.speed += num;
	if(this.speed > this.speedMax) this.speed = this.speedMax;
	if(this.speed < 0) this.speed = 0;
}

Element.prototype.vanish = function(){
	this.grid.removeElement(this);
}

exports.Element = Element;