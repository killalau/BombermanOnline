var Element = require('./Element');
var Fire = require('./Fire');

Bomb.prototype = new Element.Element();
Bomb.prototype.constructor = Bomb;
function Bomb(grid,owner){
	Element.Element.call(this, grid);
	this.classname = "Bomb";
	this.owner = owner;
	this.powerOfFire = owner.power;
	this.comboSrc = [];
	
	this.isBlockable = true;
}

Bomb.prototype.destroyRule = function(_grid,_out,direction){
	try{
	var _object;	
	var ret;
	if ( (_object = _grid.getElementByClass("Wall")) === null ){
		if ( (_object = _grid.getElementByClass("Box")) !== null ){
			ret = false;
			_out[direction].push({type:"Box",extra:_object.buff});
			new Fire.Fire(_grid);
		}else if ( (_object = _grid.getElementByClass("Buff")) !== null ){
			ret = false;
			_out[direction].push({type:"Buff",extra:null});
			new Fire.Fire(_grid);
		}else if  ( (_object = _grid.getElementByClass("Bomb")) !== null ){
			ret = false;
			if ( direction === "C"){
				_out[direction].push(null);
				new Fire.Fire(_grid);				
			}else{
				_out["Combo"].push({bomb:_object,x:_grid.position.x,y:_grid.position.y});
				_out[direction].push({type:"Bomb",extra:null});
				switch(direction){
				case "U":
					_object.comboSrc.push("D");
					break;
				case "D":
					_object.comboSrc.push("U");
					break;
				case "L":
					_object.comboSrc.push("R");
					break;
				case "R":
					_object.comboSrc.push("L");
					break;
				}
			}
		}else if ( (_object = _grid.getElementByClass("BM")) !== null ){
			var idList = [];
			for(var j = 0, e; e = _grid.elementList[j]; j++)
				if(e.classname == "BM")	idList.push(e.id);
			ret = true;
			_out[direction].push({type:"BM",extra:idList});
			new Fire.Fire(_grid);
		}else{//nothing else IE space
			ret = true;
			_out[direction].push(null);	
			new Fire.Fire(_grid);
		}
	}
	return ret;
	}catch(e){console.log("Core_bomb.destoryRule:err=",e);};
}

Bomb.prototype.vanish = function(){
	try{
	if (this.isDestroyable){
		var y = this.grid.position.y;
		var x = this.grid.position.x;
		var y0 = this.grid.position.y-this.powerOfFire;
		var y1 = this.grid.position.y+this.powerOfFire;
		var x0 = this.grid.position.x-this.powerOfFire;
		var x1 = this.grid.position.x+this.powerOfFire;
		var _BMM = this.grid.BMM;
		Element.Element.prototype.vanish.call(this);// put it here avoid bomb explode loop
		var _out = {U:[],D:[],L:[],R:[],C:[],Combo:[]};
		y0 = y0 < 0 ? 0 : y0;
		y1 = y1 >= _BMM.height ? (_BMM.height) -1: y1;
		x0 = x0 < 0 ? 0 : x0;
		x1 = x1 >= _BMM.width ? (_BMM.width) -1 : x1;

		//console.log("Bomb.vansih:y,y0,y1,x,x0,x1",{y:y,y0:y0,y1:y1,x:x,x0:x0,x1:x1});
		if (this.comboSrc.indexOf("U") == -1 )
			for(var i=y-1;i>=y0;i--) if ( ! (this.destroyRule(_BMM.gridList[i][x],_out,"U"))) break;
		if (this.comboSrc.indexOf("D") == -1 )
			for(var i=y+1;i<=y1;i++) if ( ! (this.destroyRule(_BMM.gridList[i][x],_out,"D"))) break;
		if (this.comboSrc.indexOf("L") == -1 )	
			for(var i=x-1;i>=x0;i--) if ( ! (this.destroyRule(_BMM.gridList[y][i],_out,"L"))) break;
		if (this.comboSrc.indexOf("R") == -1 )
			for(var i=x+1;i<=x1;i++) if ( ! (this.destroyRule(_BMM.gridList[y][i],_out,"R"))) break;
		this.destroyRule(_BMM.gridList[y][x],_out,"C");
		
		return _out;
	}
	}catch(e){console.log("Bomb.vanish:err=",e);};
}



exports.Bomb = Bomb;