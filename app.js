
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 3000;


var TaskList = require('./routes/tasklist');
//var taskList = new TaskList(process.env.CUSTOMCONNSTR_MONGOLAB_URI);
var taskList = new TaskList(process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'localhost');
//var taskList = new TaskList('localhost');
//var taskList = new TaskList('localhost');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, '/')));
//app.use(express.static(path.join(application_root, "/")));


// GETS
app.get('/addcard', taskList.showTasks.bind(taskList));
app.get('/', taskList.startGame.bind(taskList));


// POST
app.post('/addtask', taskList.addTask.bind(taskList));
app.post('/completetask', taskList.completeTask.bind(taskList));


// POST API
app.post('/api/addcard', taskList.addCard.bind(taskList));

// GET API
app.get('/api/getcards', taskList.getCards.bind(taskList));



/*
app.post('/api/addcard', function(req, res) {
	var data = req.body;
	res.send({
		status: 200,
		msg: data
	});
	//res.send('asdasdasd');
});
*/



// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});




// Restrictions
app.get('/app.js', function (req, res) {
	res.send('File cannot be accessed from this location');
});
app.get('/node_modules/*', function (req, res) {
	res.send('Folder cannot be accessed from this location');
});




// Socket.IO
var clients = [];
io.on('connection', function(socket){
	console.log('a user connected');


	clients.push(socket);

	// Send connected msg
	socket.emit('connected', {
		something: 'asdsadsd'
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		clients.splice(clients.indexOf(socket), 1);
	});

	/*
	socket.on('getClients', function() {
		console.log('Socket ready');
		clients.forEach(function(client, index) {

		});
	});
	*/




	// Use a express api call instead of this
	/*
	socket.on('requestConnectUsers', function(){
		console.log('socket:requestConnectUsers');
	});
	*/


	//socket.broadcast.emit('hi'); // Send to all connected expect the socket itself
	//io.emit('some event', {data:data}); // Allow client to bind to 'some event'
});




http.listen(3000, function(){
	console.log('listening on *:3000');
});
//io.listen(app.listen(port));
//app.listen(port); // Listen on port 3000
//console.log("Listening on port :" + port);
module.exports = app;
