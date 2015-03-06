var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CardSchema = new Schema({
	name: String,
	type: String,
	text: String,
	altText: String,
	//itemCompleted: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('CardModel', CardSchema);