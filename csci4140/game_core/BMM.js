var Grid = require("./Grid");

function BMM(server, room, w, h, mapConfig){
	w = w ? w : 17;
	h = h ? h : 11;
	
	this.classname = "BMM";
	this.server = server;
	this.room = room;
	this.width = w;
	this.height = h;
	this.mapConfig = mapConfig;
	this.gridList = [];
	this.elementList = [];
	this.playerList = [];
	this.gameState = 0;
	
	for(var i = 0; i < h; i++){
		this.gridList[i] = [];
		for(var j = 0; j < w; j++){
			this.gridList[i][j] = new Grid.Grid(this, {x:j, y:i});
		}
	}
}

BMM.prototype.initialize = function(){
	
}

BMM.prototype.setMap = function(){
	
}

BMM.prototype.setGrid = function(grid, position){
	if(position.x >= 0 && position.x < this.width || position.y >= 0 || position.y < this.height){
		this.gridList[position.y][position.x] = grid;
	}
}

BMM.prototype.getElementById = function(id){
	if(typeof id === 'string'){
		for(var i = 0, e; e = this.elementList[i]; i++){
			if(e.id == id){
				return e;
			}
		}
	}else{
		if(id.position.x < 0 || id.position.x > this.width || id.position.y < 0 || id.position.y > this.height){
			return null;
		}
		return this.gridList[id.position.y][id.position.x].getElementById(id.classname);
	}
	return null;
}

exports.BMM = BMM;