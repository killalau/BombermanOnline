var Lobby = window.lobby = window.lobby ? window.lobby : {};
var chatroom = window.chatroom;

Lobby.gameRoomList = [];// 0:rn,1:np,2:ping,3:button
Lobby.firstRID = 0;
Lobby.numOfRoom = 5;
Lobby.wsClient = null;

Lobby.winDragStart = function(e){
	e.preventDefault();                //do not allow draging text
	e.stopPropagation();
	e.dataTransfer.effectAllowed = "none"; 
	//console.log("dragstart");
	return null;
}

Lobby.winDragOver = function(e){
	e.preventDefault();               
	e.stopPropagation();		
	e.dataTransfer.dropEffect = "none";  
	//show the forbidden cursor 
	(document.getElementById("profile")).style.borderWidth = "5px";
	(document.getElementById("profile")).style.borderColor = "Blue";
	//console.log("dragover");
	return null;
}
Lobby.winDragOver = function(e){
	e.preventDefault();               
	e.stopPropagation();		
	e.dataTransfer.dropEffect = "none";  
	//show the forbidden cursor 
	if (e.target === document.getElementsByTagName("html")[0] || e.target === document.getElementsByTagName("body")[0]){
		(document.getElementById("profile")).style.borderWidth = "5px";
		(document.getElementById("profile")).style.borderColor = "Black";
	}
	//console.log(e.srcElement);
	return null;
}

Lobby.dropboxOver = function(e){
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = "copy";
	return null;
}

Lobby.dropboxDrop = function(e,wsClient){
	e.preventDefault();
	e.stopPropagation();
	try{
	var file = e.dataTransfer.files[0];
	//console.log(file);
	var myReader = new FileReader();
	myReader.onloadend = function (e){
		if ( e.total > 62*1024 ){
			alert("Please a photo size within 62KB");
			return;
		}
		var _file = {
			name : player_name.innerHTML,
			size : e.total,
			type : file.type,
			data : e.target.result.split(',')[1]
		};
		wsClient.sendData("icon",JSON.stringify(_file));	
		console.log(_file);
	}
	myReader.readAsDataURL(file);
	}catch(e){
		console.log(e);
	}
}

Lobby.logout= function(){
	var value = window.confirm("Are you sure to logout?");
	if (value){
		alert("logout");
		var re = /;?BomberManCookie=(.*):(.*);?/i;
		re.exec(document.cookie);
		var username = RegExp.$1;
		var session = RegExp.$2;	
		Lobby.wsClient.sendData('removeSession',JSON.stringify({session:session}));
		
		document.cookie = "BomberManCookie=logout;expires=Thu, 01 Jan 1970 00:00:01 GMT";
		document.location.href = "http://137.189.89.214:18028/index/index.php";
	}
	return null;
}

Lobby.rmUp = function(e){
	Lobby.firstRID -= 1;
	var up = document.getElementById("up");
	var down = document.getElementById("down");
	if ( Lobby.firstRID == 0 ){
		up.style.visibility = "hidden";
		up.removeEventListener("click",Lobby.rmUp,false);
		up.removeEventListener("dblclick",function(e){
			e.stopPropagation();
			e.preventDefault();
		},false);
	}	
	if ( (Lobby.gameRoomList.length - Lobby.firstRID) == (Lobby.numOfRoom + 1) ){ 
		down.style.visibility = "visible";
		down.addEventListener("click",Lobby.rmDown,false);
		down.addEventListener("dblclick",function(e){
			e.stopPropagation();
			e.preventDefault();
		},false);
	}
	Lobby.rmListRefresh();
	return null;
}

Lobby.rmDown = function(e){
	Lobby.firstRID += 1;
	var up = document.getElementById("up");
	var down = document.getElementById("down");
	if ( Lobby.firstRID + Lobby.numOfRoom == Lobby.gameRoomList.length ){ 
		down.style.visibility = "hidden";
		down.removeEventListener("click",Lobby.rmDown,false);
		down.removeEventListener("dblclick",function(e){
			e.stopPropagation();
			e.preventDefault();
		},false);
	}else if ( Lobby.firstRID == 1 ){
		up.style.visibility ="visible";
		up.addEventListener("click",Lobby.rmUp,false);
		up.addEventListener("dblclick",function(e){
			e.stopPropagation();
			e.preventDefault();
		},false);
	}
	Lobby.rmListRefresh();
	return null;
};

Lobby.joinRoom = function(rid){
	  var np = Lobby.gameRoomList[rid][1];
  try{
		if ( np == 4){
			alert("This room is full");
			return null;
		}else{
			var json = {
				rid : rid
			};
			Lobby.wsClient.sendData("joinRoom",JSON.stringify(json));
		}
	}catch(e){
		console.log(e);
	};
	
}

Lobby.rmListRefresh = function(){
	//Lobby.gameRoomList = [];
	//Lobby.firstRID = 0;
	//Lobby.numOfRoom = 5;
	try{
		for(var i = 0 ; i < Lobby.numOfRoom ; i++){
			var room_id = Lobby.firstRID + i ;
			var row_id = i*2;
			var rowObj = document.getElementById("row"+row_id);
			var rmObj = document.createElement("div");
			var rn = document.createElement("div");
			var np = document.createElement("div");
			var ping = document.createElement("div");
			var button = document.createElement("div");
			rn.className = "rm";
			np.className = "np";
			ping.className = "ping";
			button.className = "button";			
			button.addEventListener("click",function(e){
				var buf = room_id;
				return function(){//wtf clousure
					Lobby.joinRoom(buf);
				};
			}(),false);
			rmObj.appendChild(rn);
			rmObj.appendChild(np);
			rmObj.appendChild(ping);
			rmObj.appendChild(button);

			for(var j = 0 ; j < 4 ; j++){
				var tmp = rmObj.children[j];
				if (j != 3) tmp.innerHTML = Lobby.gameRoomList[room_id][j];
				else{
					if ( rmObj.children[1].innerHTML === "4" ){//num of player
						tmp.innerHTML = "Full";
						tmp.className = "full";
						tmp.id = "";
					}else{
						tmp.innerHTML = "Join";
						tmp.className = "button";
						tmp.id = "join_button";
					}
				}
			}
			rowObj.innerHTML = "";
			rowObj.appendChild(rmObj);
		}
	}catch(e){
		console.log(e);
	};
	return null;
};

Lobby.init_phase2 = function(handlers,wsClient){
	//Window--------------------------------------
	window.addEventListener("dragstart",Lobby.winDragStart,false);            
	window.addEventListener("dragover",Lobby.winDragOver,false);    
	window.addEventListener("dragleave",Lobby.winDragLeave,false); 
	//End of Window=============================== 
	
	//DropBox---------------------------------------
	var dropbox = document.getElementById("profile");
	dropbox.addEventListener("dragover",Lobby.dropboxOver,false);
	dropbox.addEventListener("drop",function(e){
		Lobby.dropboxDrop(e,wsClient);
	},false);
	//End of Dropbox---------------------------------
	
	//roomList event--------------------------------
	wsClient.sendData("rmList",null);
	/*
	var rmListEvent = setInterval(function(){
		//update rmList every 10 seconds
		//console.log("rmList refresh");
		//var json = new Object();
		//json.rid = 3;
		//json.name = "cow boy";
		//json.np = 4;
		//json.ping = 123;
		//wsClient.sendData("rmList",JSON.stringify(json));	
		wsClient.sendData("rmList",null);	
	},10000);
	*/
	//End of roomList event-------------------------

	//stat event
	wsClient.sendData("stat",null);
	var re = /;?BomberManCookie=(.*):(.*);?/i;
	re.exec(document.cookie);
  var username = RegExp.$1;
  wsClient.sendData("icon",JSON.stringify({name: username,data: false}));
	//End of stat event-------------------------

	//Logout button-------------------------------
	var logoutbutton = document.getElementById("logout");
	logoutbutton.addEventListener("click",Lobby.logout,false);
	//End of Logout Button------------------------
	
	//Up&Down button------------------------------
	var down = document.getElementById("down");
	var up = document.getElementById("up");
	up.style.visibility = "hidden";
	down.addEventListener("click",Lobby.rmDown,false);
	down.addEventListener("dblclick",function(e){
		e.stopPropagation();
		e.preventDefault();
	},false);
	//End Of Up&Down Button-----------------------	

	//Player Stat
	handlers["statACK"]=function(data,wsClient){
		try{
			var message = JSON.parse(data);
			var playerNameBox = document.getElementById("player_name");
			var statBox = document.getElementById("player_stat");
			playerNameBox.innerHTML = message.playerName;
			statBox.innerHTML = "Player Level:"+ message.playerLevel +"<br>";
			statBox.innerHTML += "Win:"+message.win + "<br>";
			statBox.innerHTML += "Lose:"+message.lose;
			//console.log(message);
		}catch(e){
			console.log(e);
		};
	};
	//End of Player Stat--------------------------

	//Player Icon
	handlers["iconACK"]=function(data,wsClient){
		var msg = JSON.parse(data);
		console.log("iconACK,msg="+msg);
		if ( !msg.result ){
			alert("Upload Fail:"+msg.reason);
			return;
		}else{
			try{
				var profileBox = document.getElementById("profile");
				if ( !msg.img ){//no any photo at first
					var text = document.createElement("p");
					text.style.fontSize = "18pt";
					text.style.textAlign = "center";
					text.style.marginTop = "100px";
					text.innerHTML = "Drop Here!";
					profileBox.innerHTML = "";
					profileBox.appendChild(text);
				}else{//"data:image/bmp;base64,ABCDE"
					profileBox.innerHTML = "";
					var img = document.createElement("img");
					img.src = msg.img;
					img.width = msg.width;
					img.height = msg.height;
					profileBox.appendChild(img);
				}
			}catch(e){
				console.log(e);
			}
		}
	};
	//End of Player Icon--------------------------

	//Rm Stat
	handlers["rmListACK"]=function(data,wsClient){
		var message = JSON.parse(data);	
		//console.log(message);
		/* 
		   message[0] =  [true,rn....]
		*/
		//console.log("rmListACK");
		try{
			for(var i = 0; i< message.length;i++){
				if(!message[i][0]){//make sure it is room stat
					Lobby.gameRoomList[message[i][1]] =[];
					for(var j=2;j<5;j++) Lobby.gameRoomList[message[i][1]].push((message[i][j]));
					//console.log(Lobby.gameRoomList[message[i][1]]);
				}
				//console.log(i);
			}	
			//console.log(Lobby.gameRoomList);
			Lobby.rmListRefresh();
		}catch(e){
			console.log(e);
		};
	};
	//End of Rm Stat------------------------------
	//joinRoom------------------------------------
	handlers["joinRoomACK"] = function(data,wsClient){
		var message = JSON.parse(data);	
				if ( message.result === false){
			alert("This room is full");
			Lobby.rmListRefresh();
			return null;
		}else{
			document.location.pathname = "/gameroom.html";
		}
	}
	//---------------------------------------------
}

Lobby.init_phase1 = function(){
	//Fetch from cookies
	var re = /;?BomberManCookie=(.*):(.*);?/i;
	re.exec(document.cookie);
  var username = RegExp.$1;
  var session = RegExp.$2;
	//============================================
	//var url = document.location.hostname +":8080";	
	var url = document.location.hostname +":18128";
	var indexUrl = 'http://'+document.location.hostname+':18028'+'/index/';
	var handlers = webSocket.createHandlers();
	var wsClient = null;
	handlers["setNameACK"]=function(data,wsClient){
		if(data === true){
			console.log("Login success in websocket");
			Lobby.wsClient = wsClient;
			Lobby.init_phase2(handlers,wsClient);
		var div = document.getElementById('chat_room');
                div.innerHTML = "";
                div.appendChild(chatroom.createChatroom(handlers, wsClient));
		}else{
			console.log("Login fail in websocket");
			console.log(indexUrl);
			window.location.replace(indexUrl);
		}
	};
	//no onclose
	wsClient = webSocket.createConnection(url,handlers, username, session); 
}

