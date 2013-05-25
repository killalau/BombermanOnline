var Grid = require("./Grid");
var Wall = require("./Wall");
var Element = require("./Element");
var Box = require("./Box");
var BM = require("./BM");
var Bomb = require("./Bomb");

var Buff = require('./Buff');//AndyQ - for testing

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
	 * original = { "item0" : 0.1, "item1" : 0.4, "None" : 0.5}
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
				_BM.bombNum = this.mapConfig.BM.bombCurrentMax;
				_BM.bombCurrentMax = this.mapConfig.BM.bombCurrentMax;
				_BM.bombMax = this.mapConfig.BM.bombMax;
				_BM.power = this.mapConfig.BM.power;
				_BM.powerMax = this.mapConfig.BM.powerMax;
				_BM.speed = this.mapConfig.BM.speed;
				_BM.speedMax = this.mapConfig.BM.speedMax;
				this.elementList.push(_BM);
				//_grid.addElement(_BM);
				break;	
			case "B"://Box
				var rand = Math.random();
				if(rand < this.mapConfig.box.NormalBox){
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
				}
				break;
			case "N"://Buff(bombpp, fire, speedpp) //AndyQ - only for testing, shud be intergrated in 'Box'
				console.log('[BMM] setMap: N');
				var rand = Math.random();
				rand = 0;//fixed for BombPlusPlus
				for(var key in _buffList){					
					if(rand < _buffList[key]){
						buff = key;
						Buff.Builder(_grid, 'BombPlusPlus');
						break;
					}
				}
				console.log('[BMM] _grid.elementList:');
				console.log(_grid.elementList);
				console.log('[BMM] grid.position (x:'+_grid.position.x+' y:'+_grid.position.y);
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
		return this.gridList[id.position.y][id.position.x].getElementByClass(id.classname);
	}
	return null;
}

/*
@public method plantBombValidation
@param x: grid.x
@param y: grid.y
@param id: BM.id
@param callback: explod bomb call back
		@param out: broadcast data
@return null or object{
					result: Boolean
					bombnum: integer
				}
**/
BMM.prototype.plantBombValidation = function(x,y,id,callback){
	try{		
		var _grid = this.gridList[y][x];
		var _BM = this.getElementById(id);
		var _out = {result:null,bombnum:_BM.bombNum};
		//console.log("COre_BMM: plantBomb_BM",_BM,"plantBomb_Grid",_grid);
		if (_grid === null || _BM === null ) throw "_grid or _BM is null";
		if (! _BM.alive ) return {result:false,bombnum:0};
		//Any trick things on that grid atm
		if ( !(_grid.getElementByClass("Bomb") === null && 
				_grid.getElementByClass("Wall") === null &&
				_grid.getElementByClass("Box") === null 
				)) _out.result = false;
		else{
			//Are there any bombs available for that BM ?
			if (_BM.bombNum <= 0 ) _out.result = false;
			else{
				_out.bombNum = --_BM.bombNum;
				_out.result = true;
				//create bomb
				new Bomb.Bomb(_grid,_BM);
				//spawn time out event
				var self = this;
				setTimeout(function(){self.explodeBomb(_grid.position.x,_grid.position.y,
										_BM.id,callback
										);},3000);
			}
		}
		return _out;
	}catch(e){console.error("[plantBombValidtation]err=",e);};
}

/*
@public method explodeBomb
@param x: grid.x
@param y: grid.y
@param id: bomb owner
@param callback: explode call back
		@param out: broadcast data
@return object{
				classname: 'Bomb'
				id:data.id//data : {id:{x:x,y:y},bm:username}
				payload:{
						U:[],
						D:[],
						L:[],
						R:[],
						C:[]
				}
			}
**/
BMM.prototype.explodeBomb = function(x,y,id,callback){
	try{
		var _BM;
		var _out = {
			classname:'Bomb',
			id:{x:x,y:y},
			payload:{}
		};
		if ((_BM = this.getElementById(id)) !== null ) _BM.bombNum++;//BM hasn't die yet		
		//console.log("core_explode:_out=",(this.getElementById({position:{x:x,y:y},classname:"Bomb"})).vanish());
		//console.log("BMM.explodeBomb:bomb.vanish=",
		//(this.getElementById({position:{x:x,y:y},classname:"Bomb"})).vanish);
		
		_out.payload = (this.getElementById({position:{x:x,y:y},classname:"Bomb"})).vanish(callback);
		//console.log("core_explode:_out=\n",_out.payload);
		
		//broadcast
		callback(_out);
		
	}catch(e){console.error("BMM.explodeBomb:err=",e);};
}

/*
@public method vanishBuffValidation
@param _x: grid.x
@param _y: grid.y
@param buffname: 'BombPlusPlus' || 'SpeedPlusPlus' || 'FirePlusPlus'
@param data : {	id:	{x:x,
					y:y}, 
				classname:<buffClassName>
			}
@param requestBM: the BM sending vanishBuff request
@param callback: wsRequestHandlers.game_broadcastVanishBuff(_out)
@param out: null || object {
	classname: buffname,
	id:	{x:x, y:y}, //identify the buff by posiiton (x,y)
	payload: requestBM //payload indicates which BM get the buff
}
*/
BMM.prototype.vanishBuffValidation = function(X, Y, buffname, requestBM, callback){
	var grid = this.gridList[Y][X];
	var out = null;
	
	/*
	 *	AndyQ - further implementation for timing consideration
	 */
	
	console.log('[CoreBMM.vanishBuffValidation]');
	try{
		for (var i = 0, e; e = grid.elementList[i]; i++){
			if (e.classname == buffname){
				var out = {
						classname: buffname,
						id:	{	x:X,
								y:Y},
						payload: requestBM 
				};
				console.log('[CoreBMM.vanishBuffValidation] (before vanish)grid.elementList:');
				console.log(grid.elementList);
				var bm = this.getElementById(requestBM);
				e.applyBuff(bm);
				console.log('[CoreBMM.vanishBuffValidation] grid.removeElement: '+e.classname);				
				grid.removeElement(e);
				console.log('[CoreBMM.vanishBuffValidation] (after vanish)grid.elementList:');
				console.log(grid.elementList);
				break;
			}
		}
		callback(out);
	}catch(e){console.log('[CoreBMM.vanishBuffValidation] err:', e);};
}

exports.BMM = BMM;