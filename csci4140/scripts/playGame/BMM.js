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
};

//constructor
BMO.BMM.consturctor = BMO.BMM;

/*
@public method setMap
@param data: map data given by server
@param onProgress: callback for loading in progress
@param onComplete: callback for loading end
**/
BMO.BMM.prototype.setMap = function(data,onProgress,onComplete){
	console.log("setMap");
	var name = data.mapname;
	var mapSkin = [name];//pixi5-MAP1.json eg
	var self = this;
	self.width = data.mapsize.width;
	self.height = data.mapsize.height;
	
	console.log("self="+self+" "+"mapSkin="+mapSkin+"onComplete="+onComplete);
	if (typeof(onComplete) !== "function" ) throw "I need a call-back for onLoadend";
	try{
		var loader = new PIXI.AssetLoader(mapSkin);
		if (typeof(onProgress) === "function") loader.onProgress = onProgress;
		loader.onComplete = function(){
			/*
			Game_Area.txt
			Screen Resolution: 960px x 560px
			A Grid Resolution: 48px x 48px ? (Our skin most likely 48x48)
			Game_Area_Max Resolution: 11 rows x 17 cols ( including the border )
			**/
			try{
				for(var i = 0; i < self.height; i++){
					self.gridList[i] = [];
					for(var j =0; j < self.width; j++){						
						var _grid = new BMO.Grid(j,i,self);
						self.gridList[i].push(_grid);
						_grid.view.addChild(PIXI.Sprite.fromFrame("tile"));
						//Wall.............						
						if ( i == 0 || i == self.height-1){
							var _wall = new BMO.Wall(_grid,self,self.wsClient);							
							_wall.setView("wall");
							_grid.addElement(_wall);
							_grid.view.addChild(_wall.view);
							//_grid.addElement
						}else{
							if ( j == 0 || j == self.width-1){
								var _wall = new BMO.Wall(_grid,self,self.wsClient);							
								_wall.setView("wall");							
								_grid.addElement(_wall);
								_grid.view.addChild(_wall.view);
							}else{
								if ( (i%2) == 0 && (j%2) == 0){
									var _wall = new BMO.Wall(_grid,self,self.wsClient);							
									_wall.setView("wall");
									_grid.addElement(_wall);
									_grid.view.addChild(_wall.view);
								}
							}
						}
						//End of wall......
						//Box..............
						
						if ( i > 2 && j > 2 && i < self.height-3 && j < self.width-3 && ((i%2) != 0 || (j%2) !=0)){
							_grid.view.addChild(PIXI.Sprite.fromFrame("box"));
						}
						//End of Box.......
						self.view.addChild(_grid.view);
					}
				}
				
				//Players.........
				for(var i = 0, p; p = data.players[i]; i++){
					var msg = {
						name : p.view,
						viewPrefix : p.viewPrefix,
						id : p.username,
						seat : p.seat,
						p1 : {
							row : p.pos.y,
							col : p.pos.x
						}
					};
					//BMO.webPageBMM.setPlayer({"name":"scripts/playGame/json/hamster_1.json","p1":{"row":1,"col":1}},false,false);
					self.setPlayer(msg,false,false);
				}
				self.setController();
				//End of players.........
				
				onComplete();
			}catch(e){throw e;};		
		};
		loader.load();
	}catch(e){throw e;};
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
@public method setPlayer
@param msg: 
		msg.name = name of the view file ;
		msg.id = player username
		msg.seat = player game room seat number [0 - 3]
		msg.p1.row = p1 init row pos
		msg.p1.col = p1 init col pos		
@param onProgress: callback for loading in progress
@param onComplete: callback for loading end
**/
BMO.BMM.prototype.setPlayer = function(msg,onProgress,onComplete){
	console.log("setPlayer");
	var playerSkin = [msg.name];//demo.json eg
	var self = this;
	console.log("self="+msg.id+" "+"playerSkin="+playerSkin);
	//if (typeof(onComplete) !== "function" ) throw "I need a call-back for onLoadend";
	try{
		var loader = new PIXI.AssetLoader(playerSkin);
		if (typeof(onProgress) === "function") loader.onProgress = onProgress;		
		loader.onComplete = function(){
			console.log("setPlayer:onComplete");
			var _grid = self.gridList[msg.p1.row][msg.p1.col];
			var _BM = new BMO.BM(_grid,self,self.wsClient);
			self.elementList.push(_BM);
			_BM.id = msg.id;
			_BM.viewPrefix = msg.viewPrefix;
			_BM.setView(msg.viewPrefix + "D0");
			_grid.view.addChild(_BM.view);
			if (onComplete) onComplete();
		};
		loader.load();
	}catch(e){throw e;};
}

/*
@public method setController
@usage: register Handlers[tag]
PS. Data flow
	^>>>wsRequesHandler[tag]
	^			v	
gServer <-- wsClient --> handlers[tag]->eventProcesser->private methods
				^
			sendata(tag)
**/
BMO.BMM.prototype.setController = function(){
	console.log("BMM:setController");
	var self = this;
	
	document.body.addEventListener("keydown",function(e){
		//self.elementList[0].eventProcesser(e);
		e.payload = null;
		self.getElementById( self.wsClient.username).eventProcesser(e);
	},false);
	document.body.addEventListener("keyup",function(e){
		//self.elementList[0].eventProcesser(e);
		self.getElementById( self.wsClient.username).eventProcesser(e);
	},false);
	
	self.handlers["game_playerMoveACK"] = function(){};
	self.handlers["game_playerStopMoveACK"] = function(){};
	self.handlers["game_broadcastPlayerMove"] = self.broadcastPlayerMove;
	self.handlers["game_broadcastPlayerStopMove"] = self.broadcastPlayerStopMove;
	self.handlers["game_broadcastPlantBomb"] = self.broadcastPlantBomb;
	self.handlers["game_broadcastExplodeBomb"] = self.broadcastExplodeBomb;
	
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
		payload: {x: target.grid.X,y:target.grid.Y}
	}
@param wsClient: wsClient
**/
BMO.BMM.prototype.broadcastPlantBomb = function(data,wsClient){
	try{
	if(data.classname == "BM"){
		var element = BMO.webPageBMM.getElementById(data.id);
		var e ={
			type: "plantBomb",
			payload: data.payload
		}
		element.eventProcesser(e);
	}
	}catch(e){throw "plantBombErr="+e;};
};

/*
@private method broadcastPlantBomb
@param data: {
		classname : "",
		id: "username" / {x:x ,y:y},
		payload: Not yet define
	}
@param wsClient: wsClient
**/
BMO.BMM.prototype.broadcastExplodeBomb =function(data,wsClient){
	try{
	}catch(e){throw "explodeBombErr="+e};
};
