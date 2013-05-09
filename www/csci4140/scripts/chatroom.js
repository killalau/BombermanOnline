var chatroom = window.chatroom = window.chatroom ? window.chatroom : {};

/* Create a chatroom DOM object(DIV)
 * support boardcast chat, and private message
 *
 * handlers: the websocket message handlers
 * client:   the client object
 */
chatroom.createChatroom = function(handlers, client){
	// Create DOM object
	var container = document.createElement('div');
	container.className = "chatroom_container";

	var content = document.createElement('div');
	content.className = "chatroom_content";

	var chat = document.createElement('div');
	chat.className = "chatroom_chat";

	var chatItems = document.createElement('ul');

	var clientList = document.createElement('div');
	clientList.className = "chatroom_clientList";

	var typearea = document.createElement('div');
	typearea.className = "chatroom_typearea";
	typearea.setAttribute('contenteditable', true);

	chat.appendChild(chatItems);
	content.appendChild(chat);
	content.appendChild(clientList);
	container.appendChild(content);
	container.appendChild(typearea);

	// Type 'Enter' to send chatroom message
	typearea.addEventListener('keypress', function(e){
		e.stopPropagation();
		if(e.keyCode == 13){	// 'Enter' key press
			e.preventDefault();
			var json = {};
			if(typearea.childNodes.length > 1){	// Private message
				if(typearea.firstChild.className == "chatroom_privateChatWith"){
					json.receiver = typearea.firstChild.innerHTML;
					json.message = typearea.innerHTML.split("</span>")[1];
					typearea.removeChild(typearea.lastChild);
				}
			}else{	// Boardcast message
				json.message = typearea.innerHTML;
				while(typearea.hasChildNodes()){
					typearea.removeChild(typearea.lastChild);
				}
			}
			// Send message out
			client.sendData('chat_say', json);
		}
	}, false);

	// Response handler
	handlers['chat_updateClientListACK'] = function(data, client){};

	// Response and update chatroom client list
	handlers['chat_updateClientList'] = function(data, client){
		clientList.innerHTML = "";
		var ul = document.createElement('ul');
		for(var i = 0, d; d = data[i]; i++){	// do for each client
			var li = document.createElement('li');
			li.innerHTML = d;
			if(d != client.username){	// private chat target
				li.style.cursor = "pointer";
				li.addEventListener('click', function(e){
					privateChatWith(this.innerHTML);
				}, false);
			}else{
				li.style.cursor = "default";
			}
			ul.appendChild(li);
		}
		clientList.appendChild(ul);
	}

	// Handler for sayACK
	handlers['chat_sayACK'] = function(data, client){
		if(!data)	// chat_say fail
			client.sendData('chat_updateClientList', null);
	}

	// Response to new message
	handlers['chat_say'] = function(data, client){
		var li = document.createElement('li');
		var txt = data.sender;
		if(data.private){
			txt += " > " + data.receiver;
			if(data.sender == client.username){
				li.className = "chat_privateSay";
			}else{
				li.className = "chat_privateMsg";
			}
		}
		txt += " : " + data.message;
		li.innerHTML = txt;
		chatItems.appendChild(li);
		chat.scrollTop = chat.scrollHeight - 125;
	}

	// Add private message tag to 'typearea'
	function privateChatWith(username){
		// Create DOM object
		var txt = document.createTextNode("");
		var span = document.createElement('span');
		span.className = "chatroom_privateChatWith";
		span.setAttribute('contenteditable', false);
		span.innerHTML = username;
		span.addEventListener('click', function(e){
			typearea.removeChild(span);
			typearea.removeChild(txt);
		}, false);

		// Clear 'typearea' and then append
		while(typearea.hasChildNodes()){
			typearea.removeChild(typearea.lastChild);
		}
		typearea.appendChild(span);
		typearea.appendChild(txt);

		// Move selection cursor to the end
		var range = document.createRange();
		range.selectNodeContents(typearea);
		range.collapse(false);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
	
	// initialize the chatroom client list
	client.sendData('chat_updateClientList', null);
	return container;
}
