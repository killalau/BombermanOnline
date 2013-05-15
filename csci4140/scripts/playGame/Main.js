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
	handlers["game_mapInitACK"] = function(data, wsClient){
		if(data){
			BMO.webPageBMM = new BMO.BMM(wsClient, handlers);
			BMO.webPageStage = new PIXI.autoDetectRenderer(960, 560);
			document.body.children[0].appendChild(BMO.webPageStage.view);
			//somehow get the map's skin name and player's skin
			BMO.webPageBMM.setMap(data,false,function(){
				requestAnimFrame(BMO.screenRefresh);
			});
			BMO.webPageBMM.setBomb(BMO.webPageBMM);
			BMO.webPageBMM.setBuff(BMO.webPageBMM);
			BMO.webPageBMM.setFire(BMO.webPageBMM);
		}else{
			alert("You should not in this page");
		}
	};
	handlers["game_jsonListACK"] =function(data,wsClient){
		try{
		var _in = JSON.parse(data);
		for(var i=0;i<_in.length;i++)
			console.log(_in[i]);
		}catch(e){console.log(e);throw e;};
	}

	wsClient.sendData("game_mapInit", true);
}

/*
@private method screenRefresh
**/
BMO.screenRefresh = function(){
	requestAnimFrame(BMO.screenRefresh);
	BMO.webPageStage.render(BMO.webPageBMM.view);	
}
