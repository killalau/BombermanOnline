var BMO = window.BMO ? window.BMO : {};

/*
@class: BM
@extends: Element
@construtor
@param _grid (BMO.Grid)
**/
BMO.BM =function(_grid,_BMM,wsClient){
	try{
		BMO.Element.call(this,_grid,_BMM);
		this.id = false;
		this.speed = 4;
		this.direction = "D";		
		this.animationIndex = 0;
		this.wsClient = wsClient;
		//this.handlers = {};
	}catch(e){throw(e);};
}

//constructor
BMO.BM.construtor = BMO.BM;
BMO.BM.prototype = Object.create( BMO.Element );

BMO.BM.prototype.startMove = function(self){
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

BMO.BM.prototype.stopMove = function(self){
	clearInterval(self.moveFunction);
	self.moveFunction = null;
}

/*
@public method move
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
		var _id = this.direction + this.animationIndex;
		this.setView(_id);
		/*
		this.view.position.x = this.X;
		this.view.position.y = this.Y;
		*/
		this._X = this.X;
		if(this._X > 0) this._X -= 48;
		this._Y = this.Y;
		if(this._Y > 0) this._Y -= 48;
		if(changeGrid == true){
			var gx = this.grid.X;
			var gy = this.grid.Y;
			if(this.X > 0) gx++;
			if(this.Y > 0) gy++;
			this.BMM.gridList[gy][gx].view.addChild(this.view);
		}
		this.view.position.x = this._X;
		this.view.position.y = this._Y;
	}catch(e){throw e;};
}

/*
@public method setDirection
@param _direction ("U":up ...)
**/
BMO.BM.prototype.setDirection = function(_direction){
	if (this.direction !== _direction) animationIndex = 0;
	this.direction = _direction;
}

/*
@public method setView
@param _id: frame_id in player.json
**/
BMO.BM.prototype.setView = function(_id){
	console.log("setAF:"+_id);
	if (!this.view) this.view = PIXI.Sprite.fromFrame(_id);
	else this.view.setTexture(PIXI.Texture.fromFrame(_id));
}

/*
@public method eventProcesser
@param event: event object
**/
BMO.BM.prototype.eventProcesser = function(e){
	var self = this;
	if ( e.type === "keydown" ){
		console.log("BM:keydown,keyIdentifier="+e.keyIdentifier);
		//canMove?
		try{	
			if (e.keyCode == 40 ) self.setDirection("D");
			else if(e.keyCode == 38) self.setDirection("U");
			else if(e.keyCode == 37) self.setDirection("L");
			else if(e.keyCode == 39) self.setDirection("R");
			else return;
			
			self.startMove(self);
			
		}catch(err){throw err;};			
	}else if( e.type === "keyup"){
		self.stopMove(self);
	}else if( e.type === "otherPlayerMove"){
		self.setDirection(e.payload);
		self.startMove(self);
		
	}else if( e.type === "otherPlayerStopMove"){
		self.stopMove(self);
	}
}
