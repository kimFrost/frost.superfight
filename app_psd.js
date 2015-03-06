var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	https = require('https'),
	http = require('http'),
	fs = require('fs'),
	connect = require('connect'),
	exec = require("child_process").exec,
	spawn = require("child_process").spawn;

var databaseUrl = "memory"; // "username:password@example.com/mydb"
var collections = ["workspaces"]
var db = require("mongojs").connect(databaseUrl, collections);

var app = express();


// Config
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	//app.use(express.static(path.join(application_root, "public")));
	app.use(express.static(path.join(application_root, "/")));
	//app.use(express.static(__dirname + '/'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// Restrictions
app.get('/app.js', function (req, res) {
	res.send('File cannot be accessed from this location');
});
app.get('/node_modules/*', function (req, res) {
	res.send('Folder cannot be accessed from this location');
});


// REST API
app.get('/api/getPsdList', function(red, res) {
	app.readPsdDir();
	res.send(app.data.psdList);
});



app.get('/api/getPsdPng/:psdFileName', function(req, res) {
	console.log("-------- Get Psd Png ---------");
	var fileName = req.params.psdFileName.replace(":","");
	if (fs.existsSync(app.data.psdFolder + fileName)) {
		exec('getSnapshot.rb ' + app.data.psdFolder + fileName, function(err, stdout, stderr) {
			console.log("*** err -->",err);
			console.log("*** stdout -->",stdout);
			console.log("*** stderr -->",stderr);
			res.json(stdout); // send to frontend console
		});
	}
});

app.get('/api/getPsdData/:psdFileName', function(req, res) {
	console.log("-------- Get Psd ---------");
	var fileName = req.params.psdFileName.replace(":","");
	if (fs.existsSync(app.data.psdFolder + fileName)) {
		console.log("File found");

		exec('process.rb ' + app.data.psdFolder + fileName, function(err, stdout, stderr) {
			console.log("*** err -->",err);
			console.log("*** stdout -->",stdout);
			console.log("*** stderr -->",stderr);
			//res.send(stdout); // send to frontend console
			res.json(stdout); // send to frontend console
		});

	}
	else {
		console.log("File not found");
	}
});



// Init
app.init = function() {
	console.log("Setup App");
	app.data = {
		psdFolder: "./Psd/",
		psdList: []
	};
	app.checkFolderStruture();
	app.readPsdDir();
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

// Get list of PSD Files
app.readPsdDir = function() {
	fs.readdir(app.data.psdFolder, function(err, files) {
		if (!err) {
			console.log("Psd files found: ", files);
			app.data.psdList = files;
		}
		else {
			console.log("err", err);
		}
	});
}
app.analysePsd = function(path) {

};



/*
app.get('/api/getPsdData/:psdFileName', function(req, res) {
	console.log("-------- Get Psd ---------");
	var fileName = req.params.psdFileName.replace(":","");
	//console.log(app.data.psdFolder + fileName);
	if (fs.existsSync(app.data.psdFolder + fileName)) {
		console.log("File found");
		//exec("ruby -v", function(err, stdout, stderr) {
		//exec("ruby examples/tree.rb", function(err, stdout, stderr) {
		//exec('ruby -e "puts \'Hello from Ruby!\'"', function(err, stdout, stderr) {

		//var cmd = "ruby -v";
		//var cmd = "ruby require 'psd'";
		//var cmd = "test.rb";
		//var cmd = "ruby require 'psd' puts 'Hello from test'";
		var cmd = 'ruby -l require \'psd\'; -e "puts \'Hello from Ruby!\'"; -e "puts \'Hello from Ruby2!\'";  ';

		exec(cmd, function(err, stdout, stderr) {
			console.log("*** err -->",err);
			console.log("*** stdout -->",stdout);
			console.log("*** stderr -->",stderr);
		});
	}
	else {
		console.log("File not found");
	}
});
*/

/*
app.get('/api/getPsdData/:psdFileName', function(req, res) {
	console.log("-------- Get Psd ---------");
	var fileName = req.params.psdFileName.replace(":","");
	if (fs.existsSync(app.data.psdFolder + fileName)) {
		console.log("File found");

		//var ruby = spawn('ruby');
		var ruby  = spawn('ruby', [__dirname + '/process.rb']);
		ruby.stdout.on('data', function (data) {
			console.log('stdout: ' + data);
		});
		ruby.stderr.on('data', function (data) {
			console.log('stderr: ' + data);
		});
		ruby.on('exit', function (code) {
			console.log('child process exited with code ' + code);
		});
		ruby.stdin.write("ping\n");

	}
	else {
		console.log("File not found");
	}
});
*/



/*
// Return Collections
app.get('/getcollections', function (req, res) {
	console.log("get collections");
	//res.send("this is the data response");
	db.workspaces.find('', function(err, data) {
		if( err || !data) console.log("No data found");
		else {

			res.send(data);
		}
	});
});


// Add Collection
app.get('/addcollection', function (req, res) {
	console.log("add collection");
	res.send("this is the data response");
	db.workspaces.save({
		title: "workspaceTitle",
		id: "uniqIdHere",
		collectionList: [
			{
				title: "collectionTitle",
				id: "uniqIdHere",
				boxList: [
					{
						title: "boxTitle",
						id: "uniqIdHere",
						elementList: [
							{
								title: "elementTitle",
								id: "uniqIdHere"
							}
						]
					}
				]
			}
		]
	}, function(err, saved) {
		if( err || !saved ) res.end( "workspace not saved");
		else res.end( "workspace saved");
	});
});

app.get('/getallusers', function (req, res) {
	db.things.find('', function(err, users) {
		if( err || !users) console.log("No users found");
		else
		{
			res.writeHead(200, {'Content-Type': 'text/plain'});
			str='';
			users.forEach( function(user) {
				str = str + user.username +'\n';
			});
			res.end( str);
		}
	});
});

app.get('/user/:username', function (req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.end( req.params.username);
	user = req.params.username;
	db.things.find({username:user}, function(err, users) {
		str='';
		if( err || !users) console.log("No users found");
		else
		{
			users.forEach( function(user) {
				str = str + 'User is '+ user.username +'\n';
				str = str + 'and email is '+ user.email +'\n';
				res.end( str);
			});
		}
	});
});

app.post('/insertmongouser', function (req, res){
	console.log("POST: ");
	res.writeHead(200, {'Content-Type': 'text/plain'});
	user = req.body.username;
	passwd = req.body.password;
	emailid = req.body.email;

	db.things.save({email: emailid, password: passwd, username: user}, function(err, saved) {
		if( err || !saved ) res.end( "User not saved");
		else res.end( "User saved");
	});
});
*/




app.init();

app.listen(1212);
console.log("Listening on port :1212");