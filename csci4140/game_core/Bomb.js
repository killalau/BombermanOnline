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

Bomb.prototype.destroyRule = function(_grid,_out,callback){
	try{
	var _object;	
	var ret;
	var _BMM = _grid.BMM;
	if ( (_object = _grid.getElementByClass("Wall")) === null ){
		if ( (_object = _grid.getElementByClass("Box")) !== null ){
			ret = false;
			_out.push({type:"Box",extra:_object.buff});
			new Fire.Fire(_grid);
		}else if ( (_object = _grid.getElementByClass("Buff")) !== null ){
			ret = false;
			_out.push({type:"Buff",extra:null});
			new Fire.Fire(_grid);
		}else if  ( (_object = _grid.getElementByClass("Bomb")) !== null ){
			ret = false;
			//Asychorize handle
			setTimeout(function(){_BMM.explodeBomb(_grid.position.x,_grid.position.y,_object.owner,callback);},10);			
		}else if ( (_object = _grid.getElementByClass("BM")) !== null ){
			var idList = [];
			for(var j = 0, e; e = _grid.elementList[j]; j++)
				if(e.classname == "BM")	idList.push(e.id);
			ret = true;
			_out.push({type:"BM",extra:idList});
			new Fire.Fire(_grid);
		}else{//nothing else IE space
			ret = true;
			_out.push(null);	
			new Fire.Fire(_grid);
		}
	}
	return ret;
	}catch(e){console.log("Core_bomb.destoryRule:err=",e);};
}

Bomb.prototype.vanish = function(callback){
	try{
	var y = this.grid.position.y;
	var x = this.grid.position.x;
	var y0 = this.grid.position.y-this.powerOfFire;
	var y1 = this.grid.position.y+this.powerOfFire;
	var x0 = this.grid.position.x-this.powerOfFire;
	var x1 = this.grid.position.x+this.powerOfFire;
	var _BMM = this.grid.BMM;
	Element.Element.prototype.vanish.call(this);// put it here avoid bomb explode loop
	var _out = {U:[],D:[],L:[],R:[],C:[]};
	y0 = y0 < 0 ? 0 : y0;
	y1 = y1 >= _BMM.height ? (_BMM.height) -1: y1;
	x0 = x0 < 0 ? 0 : x0;
	x1 = x1 >= _BMM.width ? (_BMM.width) -1 : x1;

	//console.log("Bomb.vansih:y,y0,y1,x,x0,x1",{y:y,y0:y0,y1:y1,x:x,x0:x0,x1:x1});
	for(var i=y-1;i>=y0;i--)	if ( ! (this.destroyRule(_BMM.gridList[i][x],_out["U"],callback))) break;
	for(var i=y+1;i<=y1;i++)	if ( ! (this.destroyRule(_BMM.gridList[i][x],_out["D"],callback))) break;
	for(var i=x-1;i>=x0;i--)	if ( ! (this.destroyRule(_BMM.gridList[y][i],_out["L"],callback))) break;
	for(var i=x+1;i<=x1;i++)	if ( ! (this.destroyRule(_BMM.gridList[y][i],_out["R"],callback))) break;
	this.destroyRule(_BMM.gridList[y][x],_out["C"]);
	
	return _out;
	}catch(e){console.log("Bomb.vanish:err=",e);};
}



exports.Bomb = Bomb;