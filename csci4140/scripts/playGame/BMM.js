var BMO = window.BMO ? window.BMO : {};

/*
@class BMM
@construtor	
**/
BMO.BMM = function(wsClient, handlers){
	this.width = 17;
	this.height = 11;
	this.gridList = [];
	this.elementList = [];
	this.view = new PIXI.Stage(0x000000); 
	this.wsClient = wsClient;
	this.handlers = handlers;
	this.gameState = 0;
};

//constructor
BMO.BMM.consturctor = BMO.BMM;

/*
@public method init
@param data: {
			width:
			height:
			players:[
				{username : 
				seat : 
				viewPrefix : "hamster" + (this.seat+1) + "_",
				pos : { x : px, y : py}				
				},
				...
			]
		}
**/
BMO.BMM.prototype.init = function(data){
	this.setMap(data);
	this.setWall({'default':true,payload:null});
	this.setBox({'default':true,payload:null});
	this.setPlayer(data);
	this.setController();
	console.log("BMM.init() end");
}

BMO.BMM.prototype.getElementById = function(id){
	if(typeof id === 'string'){
		for(var i = 0, e; e = this.elementList[i]; i++){
			if(e.id == id){
				return e;
			}
		}
	}
}

/*
@private method setPlayer
@param data: {
			players:[
				{username : 
				seat : 
				viewPrefix : "hamster" + (this.seat+1) + "_",
				pos : { x : px, y : py}				
				},
				...
			]
		}
**/
BMO.BMM.prototype.setPlayer = function(data){
	try{
	//console.log("setPlayer");
	for(var i=0;i<data.players.length;i++){
		var _player = data.players[i];
		var _grid = this.gridList[_player.pos.y][_player.pos.x];
		var _BM = new BMO.BM(_grid,this,this.wsClient);
		this.addElement(_BM);
		_BM.id = _player.username;
		_BM.viewPrefix = _player.viewPrefix;
		_BM.setView(_player.viewPrefix + "D0");
		_grid.view.addChild(_BM.view);
		_grid.addElement(_BM);		
	}
	}catch(e){console.log(e);alert(e);throw e};	
}

/*
@private method setMap
@param data: {
			width:
			height:
		}
**/
BMO.BMM.prototype.setMap = function(data){
	try{
	//console.log("setMap");
	var self = this;
	self.width = data.width;
	self.height = data.height;	
	for(var i = 0; i < self.height; i++){
		self.gridList[i] = [];
		for(var j =0; j < self.width; j++){						
			var _grid = new BMO.Grid(j,i,self);
			self.gridList[i].push(_grid);
			_grid.view.addChild(PIXI.Sprite.fromFrame("tile"));

			self.view.addChild(_grid.view);
		}
	}	
	}catch(e){console.log(e);alert(e);throw e;};
}

/*
@private method setWall
@param data: {
			default: Boolean
			payload: {}
		}
**/
BMO.BMM.prototype.setWall = function(data){
	try{
	//console.log("setWall");
	if(data.default){
		for(var i = 0; i < this.height; i++){
			for(var j =0; j < this.width; j++){
				//Wall.............	
				var _grid = this.gridList[i][j];
				if ( i == 0 || i == this.height-1){
					var _wall = new BMO.Wall(_grid,this,this.wsClient);							
					_wall.setView("wall");
					_grid.addElement(_wall);
					_grid.view.addChild(_wall.view);
					//_grid.addElement
				}else{
					if ( j == 0 || j == this.width-1){
						var _wall = new BMO.Wall(_grid,this,this.wsClient);							
						_wall.setView("wall");							
						_grid.addElement(_wall);
						_grid.view.addChild(_wall.view);
					}else{
						if ( (i%2) == 0 && (j%2) == 0){
							var _wall = new BMO.Wall(_grid,this,this.wsClient);							
							_wall.setView("wall");
							_grid.addElement(_wall);
							_grid.view.addChild(_wall.view);
						}
					}
				}
				//End of wall......	
			}
		}
	}else{//special handle
		
	}
	}catch(e){console.log(e);alert(e);throw e;};
}

/*
@private method setBox
@param data: {
			default: Boolean
			payload: {}
		}
**/
BMO.BMM.prototype.setBox = function(data){
	try{
	//console.log("setBox");
	if(data.default){
		for(var i = 0; i < this.height; i++){
			for(var j =0; j < this.width; j++){				
				var _grid = this.gridList[i][j];
				//Box..............				
				if ( i > 2 && j > 2 && i < this.height-3 && j < this.width-3 && ((i%2) != 0 || (j%2) !=0)){
					var _box = new BMO.Box(_grid,this,this.wsClient);
					_box.setView("box");							
					_grid.addElement(_box);
					_grid.view.addChild(_box.view);
					//_grid.view.addChild(PIXI.Sprite.fromFrame("box"));
				}
				//End of Box.......		
			}
		}
	}else{//Special handle
	}
	}catch(e){console.log(e);alert(e);throw e;};
}

/*
@private method setController
@usage: register Handlers[tag]
PS. Data flow
	^>>>wsRequesHandler[tag]
	^			v	
gServer <-- wsClient --> handlers[tag]->eventProcesser->private methods
				^
			sendata(tag)
**/
BMO.BMM.prototype.setController = function(){
	try{
	//console.log("setController");
	var self = this;
	this.myKeyDown = function(e){
		//self.elementList[0].eventProcesser(e);
		e.payload = null;
		self.getElementById( self.wsClient.username).eventProcesser(e);
	};
	this.myKeyUp = function(e){
		//self.elementList[0].eventProcesser(e);
		self.getElementById( self.wsClient.username).eventProcesser(e);
	};
	document.body.addEventListener("keydown",this.myKeyDown,false);
	document.body.addEventListener("keyup",this.myKeyUp,false);
	
	self.handlers["game_playerMoveACK"] = function(){};
	self.handlers["game_playerStopMoveACK"] = function(){};
	self.handlers["game_broadcastPlayerMove"] = self.broadcastPlayerMove;
	self.handlers["game_broadcastPlayerStopMove"] = self.broadcastPlayerStopMove;
	self.handlers["game_broadcastPlantBomb"] = function(data,wsClient){
												self.broadcastPlantBomb(data,wsClient);};
	self.handlers["game_broadcastExplodeBomb"] = function(data,wsClient){
												self.broadcastExplodeBomb(data,wsClient);};
	}catch(e){console.log(e);alert(e);throw e;};
}

BMO.BMM.prototype.broadcastPlayerMove = function(data, wsClient){
	/*
	data = {
		classname : "",
		id: "username" / {x:x ,y:y},
		payload: payload you want
	}
	*/
	try{
	//console.log("broadcastPlayerMove,this="+this);
	if(data.classname == "BM" && data.id != BMO.webPageBMM.wsClient.username){
		var element = BMO.webPageBMM.getElementById(data.id);
		var e ={
			type: "otherPlayerMove",
			payload: data.payload
		}
		element.eventProcesser(e);
	}
	}catch(e){throw "broadcastPlayerMove fail";}
};

BMO.BMM.prototype.broadcastPlayerStopMove = function(data, wsClient){
	try{
	//console.log("broadcastPlayerStopMove,this="+this);
	if(data.classname == "BM" && data.id != BMO.webPageBMM.wsClient.username){
		var element = BMO.webPageBMM.getElementById(data.id);
		var e ={
			type: "otherPlayerStopMove",
			payload: null,
		}
		element.eventProcesser(e);
	}
	}catch(e){throw "broadcastPlayerStopMove fail";}
};

/*
@private method broadcastPlantBomb
@param data: {
		classname : "",
		id: "username" / {x:x ,y:y},
		payload: {x: target.grid.X,y:target.grid.Y,bombNum:BMO.BM.bombNum}
	}
@param wsClient: wsClient
**/
BMO.BMM.prototype.broadcastPlantBomb = function(data,wsClient){
	try{
	var _in = JSON.parse(data);
	if(_in.classname == "BM"){
		var element = this.getElementById(_in.id);
		var e ={
			type: "plantBomb",
			payload: _in.payload
		}
		element.eventProcesser(e);
	}
	}catch(e){throw "plantBombErr="+e;};
};

/*
@private method broadcastExplodeBomb
@param data: {
		classname : "",
		id: "username" / {x:x ,y:y},
		payload: Not yet define
	}
@param wsClient: wsClient
**/
BMO.BMM.prototype.broadcastExplodeBomb =function(data,wsClient){
	try{
		var _in = JSON.parse(data);

		if(_in.classname == "Bomb" ){
				var _grid = this.gridList[_in.id.y][_in.id.x];
				var element = null;
				for(var i =0;i<_grid.elementList.length;i++){
						if (_grid.elementList[i].classname === "Bomb"){
							element = _grid.elementList[i];
							break;
						}
				}
				if (element == null) return;
				var e ={
						type: "explode",
						payload: _in.payload
				}
				element.eventProcesser(e);
		}
		//console.log("explode: ",_in);
	}catch(e){console.log(e);throw "explodeBombErr="+e};
};

/*
@public method addElement
@param element: BMO.Element
**/
BMO.BMM.prototype.addElement = function(element){
	this.removeElement(element);
	this.elementList.push(element);
}

/*
@public method removeElement
@param element: BMO.Element
**/
BMO.BMM.prototype.removeElement = function(element){
	for(var i = 0; i < this.elementList.length; i++){
		if(this.elementList[i] === element){
			this.elementList.splice(i, 1);
			break;
		}
	}
}
