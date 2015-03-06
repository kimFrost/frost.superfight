var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CardSchema = new Schema({
	cardName: String,
	cardType: String,
	cardText: String,
	cardAltText: String,
	//itemCompleted: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('CardModel', CardSchema);