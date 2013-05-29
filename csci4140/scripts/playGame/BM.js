var BMO = window.BMO ? window.BMO : {};

/*
@class: BM
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.BM =function(_grid,_BMM,_wsClient){
	try{
		BMO.Element.call(this,_grid,_BMM,_wsClient);
		this.classname = "BM";
		this.animationIndex = 0;
		this.viewPrefix = null;
		this.direction = "D";

		this.id = false;
		this.alive = true;
		//below attributes are overriden by map's config
		this.bombNum = -1;
		this.currentBombMax = -1;
		this.speed = -1;
		this.powerOfFire = -1;
		this.bombMax = -1;		
		this.speedMax = 0.8*48;
		this.powerMax = 8;
	}catch(e){throw(e);};
}

//constructor
BMO.BM.construtor = BMO.BM;
BMO.BM.prototype = Object.create( BMO.Element.prototype );

//static value, remember which keys the client is pressing
BMO.BM.dirKey = [];

/*
@private method startMove
@param dir: the move direction, triggered by key event, or server command
**/
BMO.BM.prototype.startMove = function(dir){
	var self = this;
	
	//client key event, record the key is pressing
	if(self.id == BMO.webPageBMM.wsClient.username){
		var index = BMO.BM.dirKey.indexOf(dir);
		if(index == -1){
			BMO.BM.dirKey.push(dir);
		}else{
			return;
		}
	}
	
	//new move, or changing direction
	if(self.moveFunction == null || dir != self.direction){
		self.setDirection(dir);
		if(self.id == self.wsClient.username){
			self.wsClient.sendData("game_playerMove", self.direction);
		}
	} 
	
	//regester move event, run every 30ms
	if(self.moveFunction == null){
		self.moveFunction = setInterval(function(){
			var gy,gx;
			switch (self.direction){
			case "U":
				gy = self.grid.Y-1;
				gx = self.grid.X;
				break;
			case "D":
				gy = self.grid.Y+1;
				gx = self.grid.X;
				break;
			case "L":
				gy = self.grid.Y;
				gx = self.grid.X-1;
				break;
			case "R":
				gy = self.grid.Y;
				gx = self.grid.X+1;
				break;
			}
			self.move(gy, gx);
		}, 30);
	}
}

/*
@private method stopMove
@param dir: which arrow key is keyup
**/
BMO.BM.prototype.stopMove = function(dir){
	//not client release key, but server stop command
	if(!dir){
		clearInterval(this.moveFunction);
		this.moveFunction = null;
	
	//a client keyup a arrow key
	}else{
		var index = BMO.BM.dirKey.indexOf(dir);
		
		//check wheather it is recorded as pressed
		if(index != -1){
			BMO.BM.dirKey.splice(index, 1);
			
			//all arrow key is keyup
			if(BMO.BM.dirKey.length == 0){
				clearInterval(this.moveFunction);
				this.moveFunction = null;
				this.wsClient.sendData("game_playerStopMove", true);
			}
		}
	}
}

/*
@private method move
@param dest_row : 2D array index row
@param dest_col : 2D array index col
**/
BMO.BM.prototype.move = function(dest_row,dest_col){
	try{
		this.animationIndex++;	
		this.animationIndex = this.animationIndex % 4	;
		
		var changeGridView = false;
		var dest_grid = this.BMM.gridList[dest_row][dest_col];
		
		switch (this.direction){
			case "U":				
				var oldY = this.Y;
				this.Y -= this.speed;
				if(this.Y <= -24){					
					changeGrid(this, dest_grid, "Y", 1);
					if (this.id == this.wsClient.username){
						this.checkBuffExist();
					}
					console.log('[BM] X:'+this.grid.X+' Y:'+this.grid.Y);
				}else if(this.Y <= 0 && oldY >0){
					changeGridView = true;
				}
				break;
			case "D":
				var oldY = this.Y;
				this.Y += this.speed;
				if(this.Y > 24){
					changeGrid(this, dest_grid, "Y", -1);
					if (this.id == this.wsClient.username){
						this.checkBuffExist();
					}
					console.log('[BM] X:'+this.grid.X+' Y:'+this.grid.Y);
				}else if(this.Y > 0 && oldY <=0){
					changeGridView = true;
				}
				break;
			case "L":			
				var oldX = this.X;
				this.X -= this.speed;
				if(this.X <= -24){
					changeGrid(this, dest_grid, "X", 1);
					if (this.id == this.wsClient.username){
						this.checkBuffExist();
					}
					console.log('[BM] X:'+this.grid.X+' Y:'+this.grid.Y);
				}else if(this.X <= 0 && oldX >0){
					changeGridView = true;
				}
				break;
			case "R":
				var oldX = this.X;
				this.X += this.speed;
				if(this.X > 24){
					changeGrid(this, dest_grid, "X", -1);
					if (this.id == this.wsClient.username){
						this.checkBuffExist();
					}
					console.log('[BM] X:'+this.grid.X+' Y:'+this.grid.Y);
				}else if(this.X > 0 && oldX <=0){
					changeGridView = true;
				}
				break;
		}
		
		function changeGrid(self, dest_gird, dir, v){
			if(self.canMove(dest_grid)){
				self[dir] += v * 48;
				self.grid.removeElement(self);
				dest_grid.addElement(self);
			}else{
				self[dir] += self.speed * v;
			}
		}
		
		var _id = this.viewPrefix + this.direction + this.animationIndex;
		this.setView(_id);
		this.updateGridView(changeGridView);	//update the view position, make sure it would not be chopped
	}catch(e){throw e;};
}

BMO.BM.prototype.canMove = function(grid){
	return !grid.isBlockable();
}

/* update the view position, make sure it would not be chopped
 * the data model and view is seperated.
 * 
 * in data model: this.X / Y, range: -24 to 23
 * in view:       this._X/_Y, range: 0 to -48
 * 
 * which means, when a element data model position is : grid[1][1].X = 1
 * in the view it may represent as : gird[1][2]._X = -47
 */
BMO.BM.prototype.updateGridView = function(changeGridView){
	this._X = this.X;
	if(this._X > 0) this._X -= 48;
	this._Y = this.Y;
	if(this._Y > 0) this._Y -= 48;
	//if(changeGridView == true){
		var gx = this.grid.X;
		var gy = this.grid.Y;
		if(this.X > 0) gx++;
		if(this.Y > 0) gy++;
		this.BMM.gridList[gy][gx].view.addChild(this.view);
	//}
	this.view.position.x = this._X;
	this.view.position.y = this._Y;
}

/* set position
 * gridX, gridY: GridList[ gridX ][ gridY ]
 * X, Y: BM.X, BM.Y (-24 to 23)
 */
BMO.BM.prototype.setPosition = function(gridX, gridY, X, Y){
	this.BMM.gridList[gridY][gridX].addElement(this);
	this.X = Math.round(X);
	this.Y = Math.round(Y);
	this.updateGridView();
}

/*
@private method checkBuffExist
**/
BMO.BM.prototype.checkBuffExist = function(){//Andy
	var elementList = this.grid.elementList;
	var len = elementList.length;
	for (var i = 0; i < len; i++){
		var classname = elementList[i].classname;
		if ((classname == 'BombPlusPlus') || (classname == 'FirePlusPlus') || (classname == 'SpeedPlusPlus')){
			this.requestVanishBuff(classname);
			break;//assuming only one buff per grid
		}
	}
}

/*
@private method requestVanishBuff
**/
BMO.BM.prototype.requestVanishBuff = function(classname){//Andy
	//data : {id:{x:x,y:y}, classname:<buffClassName>}
	console.log('[BM.requestVanishBuff] To vanish:'+classname+' At X:'+this.grid.X+' Y:'+this.grid.Y);
	var req = {
		'id':{	'x':this.grid.X,
				'y':this.grid.Y},
		'classname': classname
	};
	this.wsClient.sendData("game_vanishBuff",JSON.stringify(req));
}

/*
@public method increaseCurrentBombMax
@param num: the number of bomb to be increased
**/
BMO.BM.prototype.increaseCurrentBombMax = function(num){
	num = num ? parseInt(num) : 1;
	
	if(this.currentBombMax + num > this.bombMax){
		num = this.bombMax - this.currentBombMax;
	}
	this.bombNum += num;
	this.currentBombMax += num;
	if(this.bombNum < 0) this.bombNum = 0;
	if(this.currentBombMax < 0) this.currentBombMax = 0;
	console.log('[BM.increaseCurrentBombMax] currentBombMax:'+this.currentBombMax);
	var _out={BombNum:this.currentBombMax,
		FireNum:this.powerOfFire,
		ShoesNum:Math.round(this.speed*16/48)
	};
	console.log("inc:_out=",_out);	
	if(this.id == this.BMM.wsClient.username) this.BMM.setBuffStat(_out);	
}

/*
@public method increaseSpeed
@param num: the amount of speed to be increased
**/
BMO.BM.prototype.increaseSpeed = function(num){
	num = num ? parseInt(num) : 0.0625 * 48;
	this.speed += num;
	if (this.speed > this.speedMax) this.speed = this.speedMax;

	if (this.speed < 0.0625*48) this.speed = 0.0625*48;
	


	if (this.speed < 0.0625*48) this.speed = 0.0625*48;

	if (this.speed < 0.1*48) this.speed = 0.1*48;

	var _out={BombNum:this.currentBombMax,
		FireNum:this.powerOfFire,
		ShoesNum:Math.round(this.speed*16/48)
	};
	console.log("inc:_out=",_out);

	if(this.id == this.BMM.wsClient.username) this.BMM.setBuffStat(_out);

	if(this.id == this.BMM.wsClient.username) this.BMM.setBuffStat(_out);	

}

/*
@public method increasePower
@param num: the number of firepower to be increased
**/
BMO.BM.prototype.increasePower = function(num){
	num = num ? parseInt(num) : 1;
	this.powerOfFire += num;
	if(this.powerOfFire > this.powerMax) this.powerOfFire = this.powerMax;
	if(this.powerOfFire < 0) this.powerOfFire = 0;
	var _out={BombNum:this.currentBombMax,
		FireNum:this.powerOfFire,
		ShoesNum:Math.round(this.speed*16/48)
	};
	console.log("inc:_out=",_out);	
	if(this.id == this.BMM.wsClient.username) this.BMM.setBuffStat(_out);	
}

/*
@private method setDirection
@param _direction ("U":up ...)
**/
BMO.BM.prototype.setDirection = function(_direction){
	if (this.direction !== _direction) animationIndex = 0;
	this.direction = _direction;
}

/*
@public method setView
@param _id: frame_id in player.json
PS. Inherit from BMO.Element
**/
/*
BMO.BM.prototype.setView = function(_id){
	//Inherit from BMO.Element
}
*/

/*
@protected override method vanish()
**/
BMO.BM.prototype.vanish = function(){
	try{
	if (this.isDestroyable){
		if (this.alive){
			if (this.id == this.wsClient.username){
				document.body.removeEventListener("keydown",this.BMM.myKeyDown,false);
				document.body.removeEventListener("keyup",this.BMM.myKeyUp,false);
			}
			this.alive = false;
			this.stopMove(this.direction);
			this.wsClient = null;
			var _id = this.viewPrefix + "die";
			var self = this;
			//setTimeout(function(){self.vanish();},200);
			self.setView(_id+1);
			setTimeout(function(){
				self.setView(_id+2);
				setTimeout(function(){
					BMO.Element.prototype.vanish.call(self);
				},500);
			},800);
		}
	}
	}catch(e){console.log("BM.vanish:err=",e);};
}

/*
@public method eventProcesser
@param event: event object
**/
BMO.BM.prototype.eventProcesser = function(e){
	var self = this;
	if ( e.type === "keydown" ){
		//console.log("BM:keydown,keyIdentifier="+e.keyIdentifier);
		try{	
			if (e.keyCode == 40 ) self.startMove("D");
			else if(e.keyCode == 38) self.startMove("U");
			else if(e.keyCode == 37) self.startMove("L");
			else if(e.keyCode == 39) self.startMove("R");
			else if(e.keyCode == 32){self.eventProcesser({'type':'plantBomb','payload':e.payload});return;}
			else return;
		}catch(err){throw err;};			
	}else if( e.type === "keyup"){
		if (e.keyCode == 40 ) self.stopMove("D");
		else if(e.keyCode == 38) self.stopMove("U");
		else if(e.keyCode == 37) self.stopMove("L");
		else if(e.keyCode == 39) self.stopMove("R");
	}else if(e.type == "thisPlayerMove"){
		self.setPosition(e.payload.grid.x, e.payload.grid.y, e.payload.pos.x * 48, e.payload.pos.y * 48);
	}else if( e.type === "otherPlayerMove"){
		self.setPosition(e.payload.grid.x, e.payload.grid.y, e.payload.pos.x * 48, e.payload.pos.y * 48);
		self.startMove(e.payload.dir);
	}else if( e.type === "otherPlayerStopMove"){
		self.setPosition(e.payload.grid.x, e.payload.grid.y, e.payload.pos.x * 48, e.payload.pos.y * 48);
		self.stopMove();
	}else if( e.type === "thisPlayerStopMove"){
		self.setPosition(e.payload.grid.x, e.payload.grid.y, e.payload.pos.x * 48, e.payload.pos.y * 48);
	}else if( e.type === "plantBomb"){
		self.plantBomb(e.payload);
	}else if(e.type === "vanish"){
		self.vanish();
	}
}

/*
@private method plantBomb
@param payload{
			x: target.Grid.X;
			y: target.Grid.y;
		}
**/
BMO.BM.prototype.plantBomb = function(payload){
	//console.log("plantBomb");
	if(!payload){//payload is null
		console.log("[BM.plantBomb] plantBomb:null payload");
		if ( this.bombNum > 0){
				var req = {
						x: this.grid.X,
						y: this.grid.Y,
						bombNum: this.bombNum
				};
				this.bombNum--;
				console.log('[BM.plantBomb] '+JSON.stringify(req));
				this.wsClient.sendData("game_playerPlantBomb",JSON.stringify(req));
		}
	}else{//payload is not null
		console.log("plantBomb: payload=",payload);
		console.log("plantBomb: payload.y="+payload.y+",payload.x="+payload.x);
		if ( payload.x < 0 || payload.y < 0){//invalid plantBomb
			console.log("plantBomb: invalid");	
			this.bombNum = payload.bombNum;
		}else{//valid plantBomb
			console.log("plantBomb: valid");
			try{
			var _grid = this.BMM.gridList[payload.y][payload.x];
			var _bomb = new BMO.Bomb(_grid,this.BMM,this.wsClient,this);
			console.log("plantBomb:valid bombNum=",payload.bombNum);
			_bomb.setView("bomb_0");
			_grid.addElement(_bomb);
			_grid.view.addChild(_bomb.view);
			var index = _grid.view.children.indexOf( this.view );
			if (index != -1 ) //Cannot use directly due to our view.XY != this.grid.xy
				_grid.view.swapChildren(_bomb.view,this.view); 		
			}catch(e){console.log(e);alert(e);throw e;};
		}
		this.bombNum = payload.bombNum;
	}	
}