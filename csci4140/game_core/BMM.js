var Grid = require("./Grid");
var Wall = require("./Wall");
var Element = require("./Element");
var Box = require("./Box");
var BM = require("./BM");

function BMM(server, room, mapConfig){
	this.classname = "BMM";
	this.server = server;
	this.room = room;
	this.width = 0;
	this.height = 0;
	this.mapConfig = mapConfig;
	this.gridList = [];
	this.elementList = [];	//BM only
	this.numOfPlayer = 0;
	this.gameState = [0,0,0,0,0];//Server state, p1 state, p2 state.....
}

/*
@public method initialilze
**/
BMM.prototype.initialize = function(){
	this.setGrid();
	this.gameState[0]++;
	this.setMap();
	this.gameState[0]++;
	this.setPlayer();
	this.gameState[0]++;
	console.log("[BMM] new BMM()");
}

BMM.prototype.setPlayer = function(){
	var np = this.numOfPlayer = this.room.np();
	for(var i = 0; i < np; i++){
		//bind a client to dummy BM element, which is already on the game board
		var _pid = this.room.clientList[i].username;
		this.elementList[i].id = _pid;
		this.elementList[i].gClient = this.room.clientList[i]; 
	}
	
	//Randomize the initial position
	this.elementList.sort(function(a,b){
		return Math.random() - 0.5;
	});
	
	//Remove no player BM
	for(var i = this.elementList.length -1; i >= 0; i--){
		var e = this.elementList[i];
		if(e.gClient == null){
			this.elementList.splice(i, 1);
			e.grid.removeElement(e);
		}
	}
}

BMM.prototype.setMap = function(){
	/*
	for details, read maps/map_format.txt
	mapConfig format{
		map:["WWWWWWW..","WSWSWB..."...]
	}*/
	
	
	var map = this.mapConfig.map;
	
	/* Create items' cumulative probability
	 * _buffList = { "item0" : 0.1, "item1" : 0.5, "None" : 1}
	 */
	var _buffList = {};
	var cumSum = 0;
	for(var key in this.mapConfig.buff){
		cumSum += this.mapConfig.buff[key];
		_buffList[key] = cumSum;
	}
	
	for(var i = 0; i < this.height; i++){
		var _row = map[i];
		for(var j = 0; j < this.width; j++){
			var _grid = this.gridList[i][j];
			switch (_row[j]){
			case "W"://Wall
				//_grid.addElement( new Wall.Wall(_grid));
				//auto add to grid, when the object create
				new Wall.Wall(_grid);
				break;
			case "P"://Player
				var _BM = new BM.BM(null,_grid);
				this.elementList.push(_BM);
				//_grid.addElement(_BM);
				break;	
			case "B"://Box
				var rand = Math.random();
				var buff = "None";
				for(var key in _buffList){
					if(rand < _buffList[key]){
						buff = key;
						break;
					}
				}
				//_grid.addElement( new Box.Box(_grid, buff));
				new Box.Box(_grid, buff);
				break;		
			default://space
				break;
			}
		}
	}
}

BMM.prototype.setGrid = function(){
	this.width = this.mapConfig.width;
	this.height = this.mapConfig.height;
	
	for(var i = 0; i < this.height; i++){
		this.gridList[i] = [];
		for(var j = 0; j < this.width; j++){
			this.gridList[i][j] = new Grid.Grid(this, {x:j, y:i});
		}
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