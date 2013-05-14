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
		this.X = 0;		//Model current X pos
		this.Y = 0;		//Model current Y pos
		this._X = 0;	//View current X pos
		this._Y = 0;	//View current Y pos
		this.classname = "Element";
		this.view = null;
		this.moveFunction = null;
	}catch(e){throw(e);};
}

//constructor
BMO.Element.construtor = BMO.Element;

/*
@public method setView
@param _id: frame_id in .json 
**/
BMO.Element.prototype.setView = function(_id){
	//console.log("setAF:"+_id);
	if (!this.view) this.view = PIXI.Sprite.fromFrame(_id);
	else this.view.setTexture(PIXI.Texture.fromFrame(_id));
}

/*
@protected method vanish
**/
BMO.Element.prototype.vanish = function(){
	try{
	var _parent = this.view.parent;
	_parent.removeChild(this.view);
	this.view = null;
	this.grid.removeElement(this);
	this.grid = null;
	this.BMM.removeElement(this);
	this.BMM = null;
	}catch(e){console.log(e);throw e;}
}
