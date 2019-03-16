var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];
rooms = [];
RoomAndNames = [];
RNCounter = 0;
server.listen(process.env.Port || 3000);
console.log('Server running... ');
app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection',function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected',connections.length);

	//Disconnect
	socket.on('disconnect',function(data){
		users.splice(users.indexOf(socket.username),1);
		updateUsernames();
		if(users.length == 0){
			rooms = [];
			users = [];
			RoomAndNames = [];
			console.log("rooms cleared");
		}
		connections.splice(connections.indexOf(socket),1);
		console.log('Disconnected: %s sockets connected',connections.length);
	});

	//Send message
	socket.on('send message', function(message,roomname){
		console.log(message,roomname);
		io.sockets.emit('new message',{msg: message,user:socket.username,room:roomname});
	});

	//new user
	socket.on('new user', function(d,callback){
		console.log("new user created server");
		callback(true);
		socket.username = d;
		if(rooms.length > 0){
			io.sockets.emit('initial rooms',rooms);
		}
		users.push(socket.username);
		//updateUsernames();
	});

	//receive audio and send it to everyone
	socket.on('send audio',function(d){
		console.log("received audio");
		io.sockets.emit('new audio',{audio:true , buffer: d,user: socket.username, roomname:d.roomname});

	});

	function updateUsernames(user,room){
		io.sockets.emit('get users', user,room);
	};

	//create room
	socket.on('create room', function(d,callback){
		console.log("new room created");
		callback(true);
		socket.room = d;
		rooms.push(socket.room);
		updateRooms();
	});

	socket.on('left room', function(roomName,person,callback){
		console.log(person + " left room" + roomName);
		var temp = [roomName,person];
		callback(true);
		socket.room = d;
		rooms.push(socket.room);
		updateRooms();
	});

	//join room
	socket.on('join room', function(roomName,person,callback){
		console.log(person + " joined room" + roomName);
		var temp = [roomName,person];
		RoomAndNames.push(temp);
		updateUsernames(person,roomName);
		RNCounter++;
		if(rooms.includes(roomName) == true){
			var u = [];
			for(i = 0; i < RoomAndNames.length; i++){
				if(RoomAndNames[i][0] === roomName && u.includes(RoomAndNames[i][1]) == false){
	console.log(roomName + " function worked " + RoomAndNames[i][1]);
					u.push(RoomAndNames[i][1]);
				} 
			}
			for(var j = 0; j < u.length; j++){
				console.log(u[j]);
			}
			io.sockets.emit('initial users',u,roomName);
		}


		callback(true);
	});


	function updateRooms(){
		io.sockets.emit('get rooms', rooms);
	};

});
