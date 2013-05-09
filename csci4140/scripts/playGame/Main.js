var BMO = window.BMO ? window.BMO : {};

//Main Attribute
BMO.webPageStage = null;
BMO.webPageBMM = null;

/*
@initialization
Entry of the web page
**/
BMO.webPageInit = function (){
	var url = document.location.hostname + ":18128";
	var handlers = webSocket.createHandlers();
	var client = null;
	
	
	BMO.webPageBMM = new BMO.BMM(wsClient, handlers);
	BMO.webPageStage = new PIXI.autoDetectRenderer(960, 560);
	document.body.appendChild(BMO.webPageStage.view);
	//somehow get the map's skin name and player's skin
	BMO.webPageBMM.setMap("scripts/playGame/json/pixi5-MAP1.json",false,function(){
		requestAnimFrame(BMO.screenRefresh);
	});
	BMO.webPageBMM.setPlayer({"name":"scripts/playGame/json/demo.json","p1":{"row":1,"col":1}},false,false);
	BMO.webPageBMM.setController();
	
}

/*
@private method screenRefresh
@param _view: BMM view
**/
BMO.screenRefresh = function(){
	requestAnimFrame(BMO.screenRefresh);
	BMO.webPageStage.render(BMO.webPageBMM.view);	
}
