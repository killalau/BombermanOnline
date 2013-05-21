var Grid = require("./Grid");
var Wall = require("./Wall");
var Element = require("./Element");
var Box = require("./Box");
var BM = require("./BM");

function BMM(server, room, w, h, mapConfig, numOfPlayer){
	w = w ? w : 17;
	h = h ? h : 11;
	numOfPlayer = numOfPlayer ? numOfPlayer : 4;
	
	this.classname = "BMM";
	this.server = server;
	this.room = room;
	this.width = w;
	this.height = h;
	this.mapConfig = mapConfig;
	this.gridList = [];
	this.elementList = [];	//BM only
	this.numOfPlayer = numOfPlayer;
	//this.playerList = [];
	this.gameState = [0,0,0,0,0];//Server state, p1 state, p2 state.....
}

/*
@public method initialilze
@param pidList: ["p1ID","p2ID"....]
**/
BMM.prototype.initialize = function(pidList){
	this.setGrid();
	this.gameState[0]++;
	this.setMap();
	this.gameState[0]++;
	this.setPlayer(pidList);
	this.gameState[0]++;
}

BMM.prototype.setPlayer = function(pidList){
	var _randomSeat = [[0,1,2,3],[1,0,2,3],[1,2,0,3],[1,2,3,0]];
	var seed = Math.round(Math.random()*10)%3;
	for(var i = 0;i<pidList.length;i++){
		var _pid = pidList[i];
		//TO DO MORE
		//Maybe do some random postion placing
		this.elementList[_randomSeat[seed][i]].id = _pid;
	}
}

BMM.prototype.setMap = function(){
	/*mapConfig format{//make sure map.length == this.height && map[0].length == this.width
		map:["WWWWWWW..","WSWSWB..."...]
	}*/
	var map = [];//TO DO MORE
	var _buffList = ["BombPlusPlus","FirePlusPlus","SpeedPlusPlus"];
	for(var i = 0; i < this.height; i++){
		var _row = map[i];
		for(var j = 0; j < this.weight; j++){
			var _grid = this.gridList[i][j];
			switch (_row[j]){
			case "W"://Wall
				_grid.addElement( new Wall.Wall(_grid));
				break;
			case "P"://Player		
				if (this.elementList.length < this.numOfPlayer){
					var _BM = new BM.BM("DUMMY",_grid);
					this.elementList.push(_BM);
					_grid.addElement(_BM);
				}
				break;	
			case "B"://BOx
				_grid.addElement( new Box.Box(_grid,_buffList[Math.round(Math.random() *10)%3]));
				break;		
			default://space
				break;	
			}
		}
	}	
}

BMM.prototype.setGrid = function(){	
	for(var i = 0; i < this.height; i++){
		this.gridList[i] = [];
		for(var j = 0; j < this.weight; j++){
			this.gridList[i][j] = new Grid.Grid(this, {x:j, y:i});
		}
	}
	/*
	if(position.x >= 0 && position.x < this.width || position.y >= 0 || position.y < this.height){
		this.gridList[position.y][position.x] = grid;
	}*/
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