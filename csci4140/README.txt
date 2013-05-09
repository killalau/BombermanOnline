=====Version 6===============
Add back something I missed in combining project
- gameServer.js
	about the room creation

=====Version 5===============
Combine with Mond stuff, mainly the Lobby

Changes:
- move all HTML page in to the folder "web/"
	modify readHTML() in wsRequestHandlers.js
- fixed bug:
	joinRoom() in wsRequestHandlers.js
	bufRm= gClient.room+1;
	=> bufRm= gClient.room;
- fixed bug:
	gameRoom.removeClient()
	re-implement
- change from atrribute to function:
	gameRoom.ping()

=====Version 4===============
Changes:
- modify:
	gameClient.boardcastData()
	the boardcast data would include the event trigged username
- modify:
	script/webSocket.js
	1) ping calculation checking
	2) function for create default callback handlers
- modify:
	chatroom.html
	var handlers = {};
	=> var handlers = webSocket.createHandlers();

=====Version 3===============
PS. "main.js" is the entry point of the whole server program.

PS. "server.js", "router.js", "requestHandlers.js" is a set of program doing something like Apache

PS. "wsServer.js", "wsRouter.js", "wsRequestHandlers.js" is a set of program handle WebSocket, with a similar structure.

PS. "gameServer.js", "gameRoom.js", "gameClient.js" define 3 Class of object, which we would use in WebSocket programming.

PS. All client side Javascript is (must) placed in "scripts/"

PS. See "chatroom.html", it demo many thing. (Mainly related resources: 'scripts/webSocket.js', 'scripts/chatroom.js', 'main.js', 'wsRequestHandlers.js')

