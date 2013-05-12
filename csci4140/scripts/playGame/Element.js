var BMO = window.BMO ? window.BMO : {};

/*
@class: Element
@construtor
@param _grid (BMO.Grid)
**/
BMO.Element =function(_grid,_BMM){
	try{
		this.BMM = _BMM;
		this.grid = _grid;
		this.X = 0;
		this.Y = 0;
		this.view = null;
		this.moveFunction = null;
	}catch(e){throw(e);};
}

//constructor
BMO.Element.construtor = BMO.Element;

/*
@public method setView
@param _id: frame_id in player.json
**/
BMO.Element.prototype.setView = function(_id){
	//console.log("setAF:"+_id);
	if (!this.view) this.view = PIXI.Sprite.fromFrame(_id);
	else this.view.setTexture(PIXI.Texture.fromFrame(_id));
}



