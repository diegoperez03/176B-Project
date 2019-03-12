var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];
rooms = [];

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
		connections.splice(connections.indexOf(socket),1);
		console.log('Disconnected: %s sockets connected',connections.length);
	});

	//Send message
	socket.on('send message', function(d){
		console.log(d);
		io.sockets.emit('new message',{msg: d,user:socket.username});
	});

	//new user
	socket.on('new user', function(d,callback){
		console.log("new user created server");
		callback(true);
		socket.username = d;
		users.push(socket.username);
		updateUsernames();
	});

	//receive audio and send it to everyone
	socket.on('send audio',function(d){
		console.log("received audio");
		io.sockets.emit('new audio',{audio:true , buffer: d,user: socket.username});

	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	};

	//create room
	socket.on('create room', function(d,callback){
		console.log("new room created");
		callback(true);
		socket.room = d;
		rooms.push(socket.room);
		updateRooms();
	});

	//join room
	socket.on('join room', function(d,callback){
		console.log("room joined");
		callback(true);
	});

	function updateRooms(){
		io.sockets.emit('get rooms', rooms);
	};

});
