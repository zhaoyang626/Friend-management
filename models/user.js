const mongoose = require('mongoose');

// User Schema
const userSchema = mongoose.Schema({
	email:{
		type: String,
		required: true
	},
	friends:{
		type: Array
	},
	subscribe:{
		type: Array
	},
	follower:{
		type: Array
	},
	block:{
		type: Array
    }
});

const User = module.exports = mongoose.model('User', userSchema);

//Connect friend
module.exports.connectFriend = (emails, callback) => {
	for(var i = emails.length-1; i >= 0; i--) {
		var query = {email: {$in: emails[i]}};
		var update = {$push : {friends : emails[1-i]}};
		User.findOneAndUpdate(query, update, {multi : true}, callback);
	}
}

//Get Friends list
module.exports.getFriends = (email, callback) => {
	var query = {email: email};
    User.find(query, {friends: 1, _id: 0}, callback)
}

//Get Common Friends list
module.exports.getCommonFriends = (emails, callback) => {
	User.aggregate([
			{ $match: {email: {$in: emails}}},
			{ $unwind: "$friends" },
			{ $group: { _id: { email: "$email", data: "$friends" } } },
			{ $group: { _id: "$_id.data", count: {$sum: 1} } },
			{ $match: { count: { $gte: emails.length } } },
			{ $group: { _id: 0, result: {$push: "$_id" } } },
        	{ $project: { _id: 0, result: "$result" } } 
		], callback);
}

//subscribe
module.exports.subscribe = (req, callback) => {
	var query = {email: req.body.requestor};
	var update = {$push : {subscribe : req.body.target}};
	User.findOneAndUpdate(query, update, callback);
} 

// block
module.exports.block = (req, callback) => {
	var query = {email: req.body.requestor};
	var update = {$push : {block : req.body.target}};
	User.findOneAndUpdate(query, update, callback);
} 

//get recipient list
module.exports.getRecipientList = (req, callback) => {
	var recipientList = [];
	var query = {email: req.body.sender};
	var emails = checkIfEmailInString(req.body.text);
	if(typeof(emails) != 'undefined' && emails != null) {
		emails.forEach(function(email) {
			recipientList.push(email);
		});
	}
	var update = {$addToSet : {follower: recipientList}};
	User.findOneAndUpdate(query, update, callback);
} 

var checkIfEmailInString = function (text) { 
    var regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return text.match(regex);
}