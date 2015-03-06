var mongoose = require('mongoose'),
	Task = require('../models/task.js'),
	Card = require('../models/card.js');

module.exports = TaskList;

function TaskList(connectionString) {
	mongoose.connect(connectionString);
}

var db = mongoose.connection;

TaskList.prototype = {

	// Index
	showTasks: function (req, res) {
		Task.find({itemCompleted: false}, function foundTasks(err, items) {
			/*
			res.render('index', {
				title: 'My ToDo List',
				tasks: items
			});
			*/
			res.render('addcard');
		});
	},

	addTask: function (req, res) {
		var item = req.body;
		var newTask = new Task();
		newTask.itemName = item.itemName;
		newTask.itemCategory = item.itemCategory;
		newTask.save(function savedTask(err) {
			if (err) {
				throw err;
			}
		});
		res.redirect('/');
	},

	completeTask: function (req, res) {
		//res.send('completeTask');
		//res.send(req);
		var completedTasks = req.body;
		for (taskId in completedTasks) {
			if (completedTasks[taskId] == 'true') {
				var conditions = {_id: taskId};
				var updates = {itemCompleted: completedTasks[taskId]};
				task.update(conditions, updates, function updatedTask(err) {
					if (err) {
						throw err;
					}
				});
			}
		}
		res.redirect('/');
	},

	addCard: function(req, res) {
		var item = req.body;
		var card = new Card();
		card.name = item.name;
		card.type = item.type;
		card.text = item.text;
		card.altText = item.altText;
		// Send to db
		card.save(function(err) {
			if (err) {
				throw err;
			}
		});
		// Redirect to root after it has been send to db
		res.redirect('/');
	}
};