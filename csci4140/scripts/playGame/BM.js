var BMO = window.BMO ? window.BMO : {};

/*
@class: BM
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
**/
BMO.BM =function(_grid,_BMM,wsClient){
	try{
		BMO.Element.call(this,_grid,_BMM);
		this.classname = "BM";
		this.id = false;
		this.viewPrefix = null;
		this.speed = 4;
		this.direction = "D";		
		this.animationIndex = 0;
		this.wsClient = wsClient;
		
		this.bombMax = 8;
		this.powerMax = 8;
		this.currentBombMax = 2;
		this.bombNum = 1;
		this.powerOfFire = 2;
		this.alive = true;

	}catch(e){throw(e);};
}

//constructor
BMO.BM.construtor = BMO.BM;
BMO.BM.prototype = Object.create( BMO.Element.prototype );

/*
@private method startMove
@param self: BMO.BM
**/
BMO.BM.prototype.startMove = function(self){
	if(self.moveFunction == null){
		if(self.id == self.wsClient.username){
			self.wsClient.sendData("game_playerMove", self.direction);
		}
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
@param self: BMO.BM
**/
BMO.BM.prototype.stopMove = function(self){
	clearInterval(self.moveFunction);
	self.moveFunction = null;
	if(self.id == self.wsClient.username){
		self.wsClient.sendData("game_playerStopMove", true);
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
		
		var changeGrid = false;
		
		switch (this.direction){
			case "U":
				/*
				this.Y -= this.speed;
				if ( this.Y <= -24){
					this.Y = 24;
					this.BMM.gridList[dest_row][dest_col].view.addChild(this.view);
					this.grid = this.BMM.gridList[dest_row][dest_col];
				}*/
				var oldY = this.Y;
				this.Y -= this.speed;
				if(this.Y <= -24){
					this.Y +=48;
					//this.grid = this.BMM.gridList[dest_row][dest_col];
					this.BMM.gridList[dest_row][dest_col].addElement(this);
				}else if(this.Y <= 0 && oldY >0){
					changeGrid = true;
				}
				
				break;
			case "D":
				/*
				this.Y += this.speed;
				if ( this.Y >= 24){
					this.Y = -24;
					this.BMM.gridList[dest_row][dest_col].view.addChild(this.view);
					this.grid = this.BMM.gridList[dest_row][dest_col];
				}
				*/
				var oldY = this.Y;
				this.Y += this.speed;
				if(this.Y >= 24){
					this.Y -=48;
					//this.grid = this.BMM.gridList[dest_row][dest_col];
					this.BMM.gridList[dest_row][dest_col].addElement(this);
				}else if(this.Y > 0 && oldY <=0){
					changeGrid = true;
				}
				break;
			case "L":
				/*
				this.X -= this.speed;
				if (this.X <= -24 ){
					this.X = 24;
					this.BMM.gridList[dest_row][dest_col].view.addChild(this.view);
					this.grid = this.BMM.gridList[dest_row][dest_col];
				}
				*/
				var oldX = this.X;
				this.X -= this.speed;
				if(this.X <= -24){
					this.X +=48;
					//this.grid = this.BMM.gridList[dest_row][dest_col];
					this.BMM.gridList[dest_row][dest_col].addElement(this);
				}else if(this.X <= 0 && oldX >0){
					changeGrid = true;
				}
				break;
			case "R":
				/*
				this.X += this.speed;
				if (this.X >= 24 ){
					this.X = -24;
					this.BMM.gridList[dest_row][dest_col].view.addChild(this.view);
					this.grid = this.BMM.gridList[dest_row][dest_col];
					//PIXI will remove the child from old grid automatically
				}
				*/
				var oldX = this.X;
				this.X += this.speed;
				if(this.X >= 24){
					this.X -=48;
					//this.grid = this.BMM.gridList[dest_row][dest_col];
					this.BMM.gridList[dest_row][dest_col].addElement(this);
				}else if(this.X > 0 && oldX <=0){
					changeGrid = true;
				}
				break;		
		}
		var _id = this.viewPrefix + this.direction + this.animationIndex;
		this.setView(_id);
		/*
		this.view.position.x = this.X;
		this.view.position.y = this.Y;
		*/
		this.updateGridView();
	}catch(e){throw e;};
}

BMO.BM.prototype.updateGridView = function(){
	this._X = this.X;
	if(this._X > 0) this._X -= 48;
	this._Y = this.Y;
	if(this._Y > 0) this._Y -= 48;
	//if(changeGrid == true){
		var gx = this.grid.X;
		var gy = this.grid.Y;
		if(this.X > 0) gx++;
		if(this.Y > 0) gy++;
		this.BMM.gridList[gy][gx].view.addChild(this.view);
	//}
	this.view.position.x = this._X;
	this.view.position.y = this._Y;
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
	if (this.id == this.wsClient.username){
		document.body.removeEventListener("keydown",this.BMM.myKeyDown,false);
		document.body.removeEventListener("keyup",this.BMM.myKeyUp,false);
	}
	this.alive = false;
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

/*
@public method eventProcesser
@param event: event object
**/
BMO.BM.prototype.eventProcesser = function(e){
	var self = this;
	if ( e.type === "keydown" ){
		//console.log("BM:keydown,keyIdentifier="+e.keyIdentifier);
		//canMove?
		try{	
			if (e.keyCode == 40 ) self.setDirection("D");
			else if(e.keyCode == 38) self.setDirection("U");
			else if(e.keyCode == 37) self.setDirection("L");
			else if(e.keyCode == 39) self.setDirection("R");
			else if(e.keyCode == 32){self.eventProcesser({'type':'plantBomb','payload':e.payload});return;}
			else return;
			
			self.startMove(self);
			
		}catch(err){throw err;};			
	}else if( e.type === "keyup"){
		if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 37){
			if (e.keyIdentifier.substr(0,1) !== self.direction){ 
				e.type = "keydown";
				self.eventProcesser(e);
			}else self.stopMove(self);
		}
	}else if( e.type === "otherPlayerMove"){
		self.setDirection(e.payload.dir);
		self.startMove(self);
	}else if( e.type === "otherPlayerStopMove"){
		self.BMM.gridList[e.payload.grid.y][e.payload.grid.x].addElement(self);
		self.X = Math.round(e.payload.pos.x * 48);
		self.Y = Math.round(e.payload.pos.y * 48);
		self.updateGridView();
		self.stopMove(self);
	}else if( e.type === "thisPlayerStopMove"){
		self.BMM.gridList[e.payload.grid.y][e.payload.grid.x].addElement(self);
		self.X = Math.round(e.payload.pos.x * 48);
		self.Y = Math.round(e.payload.pos.y * 48);
		self.updateGridView();
	}else if( e.type === "plantBomb"){
		self.plantBomb(e.payload);
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
		console.log("plantBomb:null payload");
		if ( this.bombNum > 0){
				var req = {
						x: this.grid.X,
						y: this.grid.Y,
						bombNum: this.bombNum
				};
				this.bombNum--;
				this.wsClient.sendData("game_playerPlantBomb",JSON.stringify(req));
		}
	}else{//payload is not null
		console.log("plantBomb: payload.y="+payload.y+",payload.x="+payload.x);
		if ( payload.x < 0 || payload.y < 0){//invalid plantBomb
			console.log("plantBomb: invalid");	
			this.bombNum = payload.bombNum;
		}else{//valid plantBomb
			console.log("plantBomb: valid");
			try{
			var _grid = this.BMM.gridList[payload.y][payload.x];
			var _bomb = new BMO.Bomb(_grid,this.BMM,this.wsClient,this);
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