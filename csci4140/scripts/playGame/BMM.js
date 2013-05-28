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
	this.thumbnailList = [];
	this.view = new PIXI.Stage(0x000000); 
	this.wsClient = wsClient;
	this.handlers = handlers;
	this.timer = null;
	this.gameState = 0;
	this.announcement = {};
};

//constructor
BMO.BMM.consturctor = BMO.BMM;

/*
@public method init
@param data: {
			gameState:[]
			timer:
			width:
			height:
			players:[
				{username : 
				seat : 
				viewPrefix : "hamster" + (this.seat+1) + "_",
				alive: boolean
				pos : { x : px, y : py}			//which grid
				  bombNum : bm.bombNum,
					bombCurrentMax : bm.bombCurrentMax,
					bombMax : bm.bombMax,
					power : bm.power,
					powerMax : bm.powerMax,
					speed : bm.speed,
					speedMax : bm.speedMax		ombNum

				},
				...
			],
			elements:[
				{classname:
				pos: {x : x, y : y}			//which grid
				},
			walls: [],
			buffs: [],
			boxes: []				
			]
		}
**/
BMO.BMM.prototype.init = function(data){
	this.setMap(data);
	if(!data.gameState){
		this.setWall({'default':true,payload:null});
		this.setBuff({'default':true,payload:null});//Andy
		this.setBox({'default':true,payload:null});
	}else{
		this.setWall({'default':false,payload:data.walls});
		this.gameState++;
		this.wsClient.sendData('game_sync',JSON.stringify({id:this.wsClient.username,gameState:this.gameState}));
		this.setBuff({'default':false,payload:data.buffs});
		this.gameState++;
		this.wsClient.sendData('game_sync',JSON.stringify({id:this.wsClient.username,gameState:this.gameState}));
		this.setBox({'default':false,payload:data.boxes});
		this.gameState++;
		this.wsClient.sendData('game_sync',JSON.stringify({id:this.wsClient.username,gameState:this.gameState}));
		this.setTimer(data.timer);
		this.gameState++;
		this.wsClient.sendData('game_sync',JSON.stringify({id:this.wsClient.username,gameState:this.gameState}));
	}
	this.setPlayer(data);this.gameState++;
	this.wsClient.sendData('game_sync',JSON.stringify({id:this.wsClient.username,gameState:this.gameState}));
	this.setController();
	console.log("BMM.init() end");
}

/*
@pravite method game_syncACK
@param data = {
		gameState:[0-4,{id:e.id,gameState:5},{id:e.id,gameState:5},..,..],
		payload:[{id:_id,picSrc:filepath}||]
}
**/
BMO.BMM.prototype.game_syncACK = function(data){
	try{
		//console.log("game_syncACK:_in=",data);
		var _in = JSON.parse(data);
		//console.log("game_syncACK:_in=",_in);
		for (var i =0, c ; c = _in.gameState[i+1] ; i++){
			if ( (c.gameState < 5) || ((c.gameState == 5) && (_in.payload == null))){				
				var _gs = c.gameState;
				_gs = 100/5*_gs + "%";
				var _blk = {
					id: c.id,
					hamster:null,
					icon:{type:'text',
						payload:_gs
					}
				};
				//console.log("game_syncACK:_blk=",_blk);
				this.setThumbnail(_blk);				
			}else{				
				for (var i =0, c ; c = _in.payload[i] ; i++){
					var _blk = {
						id:c.id,
						hamster:null,
						icon:{type:'image',
							payload:c.picSrc
						}
					};
					//console.log("game_syncACK:_blk=",_blk);
					this.setThumbnail(_blk);
				}
			}
		}
	}catch(e){console.error("game_syncACK=err",e);};
}

/*
@pravite method setThumbnail
@param info{
			id: playerID;
			hamster: null or FrameID
			icon: {type:"text" || "image"
				   payload: "";
			}
		}
**/
BMO.BMM.prototype.setThumbnail = function(info){
	try{
	/*
	each block 
	width: 144 px
	height: 96 px
	**/
	if ((info.id == null) || (info.id == "")) 
		throw "setThumbnail:err=info.id cannot be null";
	var _infoBlock = {
		id:null,
		icon:null,
		hamster:null,
		container:null,
		frameID:null
	};
	var pass = false;
	for(var i = 0, blk; blk = this.thumbnailList[i];i++){
			if ( blk.id.text == info.id ) pass = true;
			if ( pass && (_infoBlock = blk )) break;
	}
	if ( pass ){
		//SET ICON
		/*
		info = [{id:_id, picSrc:srcUrl,gameState= bmm.gameState}]);		
			
		b.anchor = {x:0.5,y:0.5};
		
		b.position = {x:48,y:60};
		
		*/
		if ( info.icon.type == "text"){
			if (_infoBlock.icon instanceof PIXI.Text)
				_infoBlock.icon.setText(info.icon.payload);
			else{
				_infoBlock.removeChild(_infoBlock.icon);
				_infoBlock.icon = new PIXI.Text(info.icon.payload);
				_infoBlock.icon.anchor = {x:0.5,y:0.5};
				_infoBlock.icon.position = {x:48,y:60};
				_infoBlock.icon.setStyle({fill:"white"});
				_infoBlock.container.addChild(_infoBlock.icon);
			}
		}else{//image
			if ((_infoBlock.icon instanceof PIXI.Sprite) && (!(_infoBlock.icon instanceof PIXI.Text)) ){
				_infoBlock.icon.setTexture(PIXI.Texture.fromFrame(info.icon.payload)); 
				var w,h,ratio;
				w = _infoBlock.icon.width;
				h = _infoBlock.icon.height;
				ratio = w/h;
				_infoBlock.icon.height = _infoBlock.icon.height > 48 ? 48 : _infoBlock.icon.height;
				w = ratio * _infoBlock.icon.height;
				_infoBlock.icon.width = w > 72 ? 72 : w;				
			}else{							
				var _img = new PIXI.ImageLoader(info.icon.payload,false);
				_infoBlock.container.removeChild(_infoBlock.icon);
				_infoBlock.frameID = info.icon.payload;
				_img.addEventListener("loaded",function(){
					return function(){
					var w,h,ratio;
					_infoBlock.icon = new PIXI.Sprite.fromFrame(info.icon.payload);
					_infoBlock.icon.anchor = {x:0.5,y:0.5};
					_infoBlock.icon.position = {x:48,y:60};	
					
					w = _infoBlock.icon.width;
					h = _infoBlock.icon.height;
					ratio = w/h;
					_infoBlock.icon.height = _infoBlock.icon.height > 48 ? 48 : _infoBlock.icon.height;
					w = ratio * _infoBlock.icon.height;
					_infoBlock.icon.width = w > 72 ? 72 : w;
					_infoBlock.container.addChild(_infoBlock.icon);
					}
				}());
				_img.load();
			}
		}
		
	}else{
		//SET position && hamster
		var len = this.thumbnailList.length;
		var _text = info.id;
		if (_text.length > 11 ){
			var re = /^([.]{8})/;
			re.test(_text);
			_text = RegExp.$1 + "...";
		}
		_infoBlock.container = new PIXI.DisplayObjectContainer();
		//this.timer.position = {x:(17*48),y:(11*48)};
		_infoBlock.container.position = {x:(17*48),y:(len*96)};
	  _infoBlock.hamster = new PIXI.Sprite.fromFrame(info.hamster);
	  _infoBlock.icon = new PIXI.Text("0%");
	  _infoBlock.id = new PIXI.Text(_text); 
	  _infoBlock.id.setStyle({fill:"orange"});
	  _infoBlock.id.position = {x:72,y:0};
	  _infoBlock.id.anchor.x = 0.5;
	  _infoBlock.icon.anchor = {x:0.5,y:0.5};
	  _infoBlock.icon.position = {x:48,y:60};
	  _infoBlock.icon.setStyle({fill:"white"});
	  _infoBlock.hamster.position = {x:108,y:60};
	  _infoBlock.hamster.anchor = {x:0.5,y:0.5};
	  _infoBlock.hamster.scale = {x:1.5,y:1.5};
	  _infoBlock.container.addChild(_infoBlock.id);
	  _infoBlock.container.addChild(_infoBlock.icon);
	  _infoBlock.container.addChild(_infoBlock.hamster);
	  this.thumbnailList.push(_infoBlock);
	  this.view.addChild(this.thumbnailList[len].container);
	}

	}catch(e){console.error(e);throw e;};

	
	
}

BMO.BMM.prototype.getElementById = function(id){
	if(typeof id === 'string'){
		for(var i = 0, e; e = this.elementList[i]; i++){
			if(e.id == id){
				return e;
			}
		}
		return null;
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
				bombNum :
				bombCurrentMax:
				...
			]
		}
**/
BMO.BMM.prototype.setPlayer = function(data){
	try{
	//console.log("setPlayer");
	for(var i=0;i<data.players.length;i++){
		var _player = data.players[i];
		if ( _player.alive ){
			var _grid = this.gridList[_player.pos.y][_player.pos.x];		
			var _BM = new BMO.BM(_grid,this,this.wsClient);
			this.addElement(_BM);
			_BM.id = _player.username;
			_BM.viewPrefix = _player.viewPrefix;
			_BM.setView(_player.viewPrefix + "D0");
			_BM.alive = _player.alive;
			_BM.bombNum = _player.bombNum;
			_BM.currentBombMax = _player.bombCurrentMax;
			_BM.bombMax = _player.bombMax;
			_BM.powerOfFire = _player.power;
			_BM.powerMax = _player.powerMax;
			_BM.speed = _player.speed * 48;
			_BM.speedMax = _player.speedMax * 48;
			_grid.view.addChild(_BM.view);
			_grid.addElement(_BM);	
		}
		this.setThumbnail({id:_player.username,hamster:(_player.viewPrefix + "D0"),icon:null});
	}
	}catch(e){console.log(e);alert(e);throw e};	
}

/*
@private method setMap
@param data: {
			width:
			height:
			elements:[
				{classname:
				pos: {x : x, y : y}			//which grid
				}
			]
		}
**/
BMO.BMM.prototype.setMap = function(data){
	try{
	/*
	Game_Area.txt
	Screen Resolution: 960px x 560px
	Game Resolution: 816px x 528px
	A Grid Resolution: 48px x 48px ? (Our skin most likely 48x48)
	Game_Area_Max Resolution: 11 rows x 17 cols ( including the border )
	**/
	
	console.log("setMap");
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
	
	//initialize 
	if(data.gameState && data.gameState[0] >= 3){
		for(var i = 0, e; e = data.elements[i]; i++){
			var _grid = this.gridList[e.pos.y][e.pos.x];
			switch(e.classname){
			default:
				console.log(e.classname);
				break;
			}
		}
	}
	
	}catch(e){console.log(e.message);alert(e);throw e;};
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
	console.log("setWall");
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
		for(var i = 0, e; e = data.payload[i]; i++){
			var _grid = this.gridList[e.pos.y][e.pos.x];
			var _wall = new BMO.Wall(_grid,this,this.wsClient);
			_wall.setView("wall");
			_grid.addElement(_wall);
			_grid.view.addChild(_wall.view);			
		}					
	}
	}catch(e){console.log(e);alert(e);throw e;};
}


/*
@private method setBuff
@param data: {
			default: Boolean
			payload: {}
		}
**/

BMO.BMM.prototype.setBuff = function(data){//Andy
	try{
		if(data.default){
		//default position for planting buff
			for(var i = 0; i < this.height; i++){
				for(var j =0; j < this.width; j++){
					var _grid = this.gridList[i][j];
					
					if ( i == 1 && j == 2){
						var _buff = new BMO.BombPlusPlus(_grid,this,this.wsClient);
						_buff.setView("BombPlusPlus");							
						_grid.addElement(_buff);
						_grid.view.addChild(_buff.view);
						//_grid.view.addChild(PIXI.Sprite.fromFrame("box"));
					}					
				}
			}
		}else{
			for(var i = 0, e; e = data.payload[i]; i++){
				var _grid = this.gridList[e.pos.y][e.pos.x];
				switch(e.classname){
				case "BombPlusPlus":
					console.log('[BMM] new BombPlusPlus');
					var _bombPP = new BMO.BombPlusPlus(_grid,this,this.wsClient);
					console.log('[BMM] setView BombPlusPlus');
					_bombPP.setView("BombPlusPlus");							
					_grid.addElement(_bombPP);
					_grid.view.addChild(_bombPP.view);
				//TO-DO
				break;
				case "FirePlusPlus":
					console.log('[BMM] new FirePlusPlus');
					var _bombPP = new BMO.FirePlusPlus(_grid,this,this.wsClient);
					console.log('[BMM] setView FirePlusPlus');
					_bombPP.setView("FirePlusPlus");
					console.log('[BMM] grid.addElement FirePlusPlus');
					_grid.addElement(_bombPP);
					console.log('[BMM] view.addChild FirePlusPlus');
					_grid.view.addChild(_bombPP.view);
				//TO-DO
				break;
				case "SpeedPlusPlus":
					var _bombPP = new BMO.SpeedPlusPlus(_grid,this,this.wsClient);
					_bombPP.setView("SpeedPlusPlus");							
					_grid.addElement(_bombPP);
					_grid.view.addChild(_bombPP.view);
				//TO-DO
				break;
				}
			}
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
		for(var i = 0, e; e = data.payload[i]; i++){
			var _grid = this.gridList[e.pos.y][e.pos.x];
			var _box = new BMO.Box(_grid,this,this.wsClient);
			_box.setView("box");							
			_grid.addElement(_box);
			_grid.view.addChild(_box.view);	
		}
	}
	}catch(e){console.log(e);alert(e);throw e;};
}

/*
@private method setTimer
@param data: string in seconds eg 120 //120 second left
**/
BMO.BMM.prototype.setTimer = function(time){
	try{
	var _t = parseInt(time);
	if (this.timer === null){
		this.timer = new PIXI.Text("");
		this.timer.position = {x:(17*48),y:(11*48)};
		this.timer.setStyle({font: "bold 30px Arial", fill: "yellow", align: "center"});
		this.view.addChild(this.timer);
	}
	var min = Math.floor(_t/60);
	var sec = _t %60;
	sec = sec >= 10 ? sec : ("0"+sec) ;
	var _show = "0"+min+":"+sec;
	_show = "---"+_show+"---";
	this.timer.setText(_show);
	
	}catch(e){console.error("BMM.setTimer:err=",e);};
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
	
	//key event is add, untill all player ready (gameStart())
	/*
	if ( self.getElementById(self.wsClient.username) !== null){
		document.body.addEventListener("keydown",this.myKeyDown,false);
		document.body.addEventListener("keyup",this.myKeyUp,false);
	}   
	*/
	
	self.handlers["game_playerMoveACK"] = function(){};
	self.handlers["game_playerStopMoveACK"] = function(){};
	self.handlers["game_broadcastPlayerMove"] = self.broadcastPlayerMove;
	self.handlers["game_broadcastPlayerStopMove"] = self.broadcastPlayerStopMove;
	self.handlers["game_broadcastPlantBomb"] = function(data,wsClient){
												self.broadcastPlantBomb(data,wsClient);};
	self.handlers["game_broadcastExplodeBomb"] = function(data,wsClient){
												self.broadcastExplodeBomb(data,wsClient);};
	self.handlers["game_broadcastVanishBuff"] = function(data,wsClient){//Andy
												self.broadcastVanishBuff(data,wsClient);};	
	self.handlers["game_syncACK"] = function(data,wsClient){
												self.game_syncACK(data);
											}
	self.handlers["game_gameStart"] = function(data,wsClient){
										self.game_gameStart(data, wsClient);};
	self.handlers["game_gameEnd"] = function(data,wsClient){
										self.game_gameEnd(data);};										
	}catch(e){console.log(e);alert(e);throw e;};
}

/*
@private method game_gameEnd(data)
@param data = {
	result : "win" / "draw"
	winner : username
}
**/
BMO.BMM.prototype.game_gameEnd = function(data){
	try{
		
		var _in = JSON.parse(data);
		document.body.removeEventListener("keydown",this.myKeyDown,false);
		document.body.removeEventListener("keyup",this.myKeyUp,false);	
		var _data = {
			classname:"BM",
			id:"",
			payload:{
				dir:"D",
				grid:null,
				pos:{x:0.5,y:0.5}
			}			
		};
		for(var i =0, e; e = this.elementList[i];i++){
			_data.id = e.id;
			_data.payload.grid = {x:e.grid.X,y:e.grid.Y};
			this.broadcastPlayerStopMove(_data,{username:this.wsClient.username});
		}
		if ( _in.result == "win"){
			/*
			this.announcement.text
			position={x:408,y:264}
			anchor={x:0.5,y:0.5}
			style={fill:"white",font:"bold 50pt Arial"};
			this.announcement.icon
			position={x:408,y:384}
			anchor={x:0.5,y:0.5}			
			**/
			
			/*w = _infoBlock.icon.width;
			h = _infoBlock.icon.height;
			ratio = w/h;
			_infoBlock.icon.height = _infoBlock.icon.height > 48 ? 48 : _infoBlock.icon.height;
			w = ratio * _infoBlock.icon.height;
			_infoBlock.icon.width = w > 72 ? 72 : w;*/
			var _blk;
			for (var i =0,e;e=this.thumbnailList[i];i++){
				if (_in.winner == e.id.text){
					_blk = e;
					break;
				}
			}
			var _text = new PIXI.Text("Winner is "+_in.winner);
			_text.anchor = {x:0.5,y:0.5};
			_text.position = {x:408,y:264};
			_text.setStyle({fill:"white",font:"bold 50pt Arial"});
			var _icon = new PIXI.Sprite.fromFrame(_blk.frameID);
			_icon.anchor = {x:0.5,y:0.5};
			_icon.position = {x:408,y:384};
			var w,h,ratio;			
			//w = 480;
			//h = 192;
			ratio = _icon.width/_icon.height;
			_icon.height = _icon.height > 192 ? 192 : _icon.height;
			w = ratio * _icon.height;
			_icon.width = w;			
			this.announcement.text = _text;
			this.announcement.icon = _icon;
			this.view.addChild(this.announcement.text);
			this.view.addChild(this.announcement.icon);			
		}else{//draw
			var _text = new PIXI.Text("Draw Game");
			_text.anchor = {x:0.5,y:0.5};
			_text.position = {x:408,y:264};	
			_text.setStyle({fill:"white",font:"bold 50pt Arial"});
			this.announcement.text = _text;
			this.view.addChild(this.announcement.text);
		}
		
		setTimeout(function(){
			document.location.pathname = "/gameroom.html";
		},5000);
	}catch(e){console.error("gameEnd:err=",e);};
};


/* boardcast message about a player move
 *
 * data = {
 * 		classname : "BM",
 * 		id : username,
 * 		payload : {
 *			dir : "U" / "D" / "L" / "R"
 * 			grid : {x:x, y:y}		//gridList[y][x]
 *			pos : {x:x, y:y}}}		//position inside a grid (0 to 1) need to scale
 */
BMO.BMM.prototype.broadcastPlayerMove = function(data, wsClient){
	try{
	//console.log("broadcastPlayerMove,this="+this);
	if(data.classname == "BM"){
		var element = BMO.webPageBMM.getElementById(data.id);
		var e ={
			type: "otherPlayerMove",
			payload: data.payload
		}
		if(data.id == BMO.webPageBMM.wsClient.username){
			e.type = "thisPlayerMove";
		}
		element.eventProcesser(e);
	}
	}catch(e){throw "broadcastPlayerMove fail";}
};

/* boardcast message about a player stop moving
 *
 * data = {
 * 		classname : "BM",
 * 		id : username,
 * 		payload : {
 * 			grid : {x:x, y:y}		//gridList[y][x]
 *			pos : {x:x, y:y}}}		//position inside a grid (0 to 1) need to scale
 */
BMO.BMM.prototype.broadcastPlayerStopMove = function(data, wsClient){
	try{
	//console.log("broadcastPlayerStopMove,this="+this);
	if(data.classname == "BM"){
		var element = BMO.webPageBMM.getElementById(data.id);
		var e ={
			type: "otherPlayerStopMove",
			payload: data.payload
		}
		if(data.id == BMO.webPageBMM.wsClient.username){
			e.type = "thisPlayerStopMove";
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
		payload: {
				U:[],
				D:[],
				L:[],
				R:[],
				C:[]
			}
		}
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
@private method broadcastVanishBuff
@param data: {
		classname : 'firepluss' or 'SpeedPlusPlus' or 'BombPlusPlus',
		id: "username" / {x:x ,y:y},
		payload: '<target BM which get the buff>'
	}
@param wsClient: wsClient
**/
BMO.BMM.prototype.broadcastVanishBuff = function(data,wsClient){//Andy
	try{
		var _in = JSON.parse(data);
		console.log('[BMM.broadcastVanishBuff] _in:'+JSON.stringify(_in));		
		if((_in.classname == "FirePlusPlus") || (_in.classname == "SpeedPlusPlus") || (_in.classname == "BombPlusPlus")){
			var _grid = this.gridList[_in.id.y][_in.id.x];
			var element;
			for(var i =0;i<_grid.elementList.length;i++){
					if (_grid.elementList[i].classname == _in.classname){
						element = _grid.elementList[i];
						break;
					}
			}
			//event message for vanish
			var e = {
					//AndyQ
					type: "applyBuff",
					payload: _in.payload
			};
			element.eventProcesser(e);
		}
	}catch(e){console.log(e.message);throw 'vanishBuffErr='+e};
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

/*
@public method timerStart
**/
BMO.BMM.prototype.timerStart = function(){
	var self = this;
	var bar = function(){
			var _str = self.timer.text;
			var re = /([0-9]{2}):([0-9]{2})/;
			re.test(_str);
			var min = parseInt(RegExp.$1);
			var sec = parseInt(RegExp.$2);
			var time = min*60+sec;
			return --time;
		};
	var foo = setInterval(function(){
			var t;
			console.log("timer");
			if ( (t = bar()) > -1 ){
				self.setTimer(t);				
			}else{
				clearInterval(foo);
			}
		},1000);
};
/* Count down for "3,2,1,GO"
 * Start rancing during the "GO" is displayed
 */
BMO.BMM.prototype.countDown = function(){
	function createText(text){
		var obj = new PIXI.Text(text);
		obj.setStyle({font: "bold 100px Arial", fill:"white"});
		obj.position = {x:408, y:264};
		obj.anchor = {x:0.5,y:0.5};
		return obj;
	}
	
	var self = this;
	self.countDown.obj = null;
	var textAry = ["3", "2", "1", "GO", ""];
	
	for(var i = 0; i < 5; i++){			
		setTimeout(function(){
			var index = i;
			return function(){
				if(self.countDown.obj != null){
					self.view.removeChild(self.countDown.obj);
				}
				if(textAry[index].length > 0){
					var obj = createText(textAry[index]);
					self.view.addChild(obj);
					self.countDown.obj = obj;
				}else{
					self.countDown.obj = null;
				}
			}
		}(), 1000 * i);
	}
	
	setTimeout(function(){
		self.gameStart();
	}, 3000);
}

/* Start counting Time, addEventListener
 * Will only run once
 */
BMO.BMM.prototype.gameStart = function(){
	if(!this.gameStart.already){
		this.timerStart();
		if ( this.getElementById(this.wsClient.username) !== null){
			document.body.addEventListener("keydown",this.myKeyDown,false);
			document.body.addEventListener("keyup",this.myKeyUp,false);
		}
		
		this.gameStart.already = true;
	}
}

/*
@public method game_gameStart
called when server said, all player ready (initialize finished)

@param
data: [3,{id:e.id,gameState:5},{id:e.id,gameState:5},..,..] //gameState
**/
BMO.BMM.prototype.game_gameStart = function(data, wsClient){
	//The first time, all players ready
	if(data[0] == 3){
		this.countDown();
		this.game_gameStart.already = true;
	
	//Someone refresh the page, so that data[0] == 4
	//and which is the guy didn't run game_gameStart before
	}else if(!this.game_gameStart.already){
		this.gameStart();
	}
}