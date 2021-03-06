
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();


var TaskList = require('./routes/tasklist');
var taskList = new TaskList(process.env.CUSTOMCONNSTR_MONGOLAB_URI);
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
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


/*
var index = require('./routes/index');
var users = require('./routes/users');
*/

/*
app.use('/', index);
app.use('/users', users);
*/

// GETS
app.get('/', taskList.showTasks.bind(taskList));

// POST
app.post('/addtask', taskList.addTask.bind(taskList));
app.post('/completetask', taskList.completeTask.bind(taskList));
//app.post('/addcard', taskList.addCard.bind(taskList));


app.get('api/addcard', function(req, res) {
	res.send({
		status: 'blahh',
		req: req,
		res: res
	});
});




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






app.listen(3000); // Listen on port 3000

module.exports = app;
