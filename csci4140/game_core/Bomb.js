var Element = require('./Element');
var Fire = require('./Fire');

Bomb.prototype = new Element.Element();
Bomb.prototype.constructor = Bomb;
function Bomb(grid,owner){
	Element.Element.call(this, grid);
	this.classname = "Bomb";
	this.owner = owner;
	this.powerOfFire = owner.power;
	
	this.isBlockable = true;
}

Bomb.prototype.destroyRule = function(_grid){
	var _object;
	var _out = [];
	if ( (_object = _grid.getElementById("Wall")) === null ){
		if ( (_object = _grid.getElementById("Box")) !== null ){
			_out.push({type:"Box",extra:_object.buff});
			new Fire.Fire(_grid);
		}else if ( (_object = _grid.getElementById("Buff")) !== null ){
			_out.push({type:"Buff",extra:null});
			new Fire.Fire(_grid);
		}else if  ( (_object = _grid.getElementById("Bomb")) !== null ){
			//Asychorize handle
			setTimeout(function(){_BMM.explodeBomb(_grid.position.x,_grid.position.y,_object.owner);},50);
			_out = null;
		}else if ( (_object = _grid.getElementById("BM")) !== null ){
			var idList = [];
			for(var j = 0, e; e = _grid.elementList[j]; j++)
				if(e.classname == "BM")	idList.push(e.id);
			_out.push({type:"BM",extra:idList});
			new Fire.Fire(_grid);
		}else{//nothing else IE space
			_out.push(null);	
			new Fire.Fire(_grid);
		}
	}
	return _out;
}

Bomb.prototype.vanish = function(){
	var y = this.grid.position.y;
	var x = this.grid.position.x;
	var y0 = this.grid.position.y-this.powerOfFire;
	var y1 = this.grid.position.y+this.powerOfFire;
	var x0 = this.grid.position.x-this.powerOfFire;
	var x1 = this.grid.position.x+this.powerOfFire;
	var _BMM = this.grid.BMM;
	Element.prototype.vanish.call(this);// put it here avoid bomb explode loop
	var _out = {U:[],D:[],L:[],R:[]};
	y0 = y0 < 0 ? 0 : y0;
	y1 = y1 >= _BMM.height ? (_BMM.height) : y1;
	x0 = x0 < 0 ? 0 : x0;
	x1 = x1 >= _BMM.width ? (_BMM.width) : x1;

	//Not done yet
	for(var i=y;i>=y0;i--)	_out["U"].push(this.destroyRule(_BMM.gridList[i][x]));
	for(var i=y;i<y1;i++)	_out["D"].push(this.destroyRule(_BMM.gridList[i][x]));
	for(var i=x;i>=x0;i--)	_out["L"].push(this.destroyRule(_BMM.gridList[y][i]));
	for(var i=x;i<x1;i++)	_out["R"].push(this.destroyRule(_BMM.gridList[y][i]));
	
	return _out;
}



exports.Bomb = Bomb;