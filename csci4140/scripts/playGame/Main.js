var BMO = window.BMO ? window.BMO : {};

//Main Attribute
BMO.webPageStage = null;
BMO.webPageBMM = null;

/*
@initialization
Entry of the web page
**/
BMO.webPageInit = function (){
	//Fetch from cookies
	var re = /;?BomberManCookie=(.*):(.*);?/i;
	re.exec(document.cookie);
	var username = RegExp.$1;
	var session = RegExp.$2;
	//============================================	
	var url = document.location.hostname +":18128";
	var handlers = webSocket.createHandlers();
	var wsClient = null;
	
	handlers["setNameACK"]=function(data,wsClient){
		if(data === true){
			console.log("Login success in websocket");
			BMO.webPageInit_phase2(handlers,wsClient);
		}
	};
	//no onclose
	wsClient = webSocket.createConnection(url, handlers, username, session); 
	
}

BMO.webPageInit_phase2 = function(handlers,wsClient){
	handlers["game_jsonListACK"] =function(data,wsClient){
		try{
		var _in = JSON.parse(data);

		var loader = new PIXI.AssetLoader(_in);
		loader.onComplete = function(){console.log(this);wsClient.sendData("game_init",null);};
		loader.load();
		}catch(e){throw e;};
	};
	handlers["game_initACK"] = function(data,wsClient){
		try{
		var _in = JSON.parse(data);
		console.log(_in);
		if( _in){
			var _BMM = new BMO.BMM(wsClient, handlers);
			var _stage = new PIXI.autoDetectRenderer(960, 560);
			BMO.webPageBMM = _BMM;
			BMO.webPageStage = _stage;
			document.body.children[0].appendChild(BMO.webPageStage.view);
			_BMM.init(_in);
			requestAnimFrame(BMO.screenRefresh);
		}else{
				//alert("You should not in this page");
				document.location.pathname = "/Lobby.html";
		}
		}catch(e){console.log(e);throw e;};

	};


	wsClient.sendData("game_jsonList", null);
}

/*
@private method screenRefresh
**/
BMO.screenRefresh = function(){
	requestAnimFrame(BMO.screenRefresh);
	BMO.webPageStage.render(BMO.webPageBMM.view);	
}
