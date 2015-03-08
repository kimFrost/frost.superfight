var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	https = require('https'),
	http = require('http'),
	fs = require('fs'),
	//connect = require('connect'),
	exec = require("child_process").exec,
	spawn = require("child_process").spawn;

//var databaseUrl = "memory"; // "username:password@example.com/mydb"
//var collections = ["workspaces"]
//var db = require("mongojs").connect(databaseUrl, collections);

var app = express();


// Config

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(application_root, "/")));


// Restrictions
app.get('/app.js', function (req, res) {
	res.send('File cannot be accessed from this location');
});
app.get('/node_modules/*', function (req, res) {
	res.send('Folder cannot be accessed from this location');
});


// REST API
app.get('/api/getPsdList', function(req, res) {
	res.send('asdasdsadsda');
});







// Init
app.init = function() {
	console.log("Setup App");
	app.data = {
		psdFolder: "./Psd/",
		psdList: []
	};
	app.checkFolderStruture();
};

// Create folder structure
app.checkFolderStruture = function() {
	console.log("checkFolderStruture");
	if (fs.existsSync(app.data.psdFolder)) {
		console.log("psd folder is present");
	}
	else {
		console.log("psd folder is not present");
		fs.mkdir(app.data.psdFolder, function(err) {
			if (err) { throw err; }
		});
	}
};



app.init();

app.listen(3000);
console.log("Listening on port :3000");