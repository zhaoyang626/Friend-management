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
		var update = {$addToSet : {friends : emails[1-i]}};
		User.findOneAndUpdate(query, update, {multi : true, upsert: true, new: true}, callback);
	}
}

//Get Friends list
module.exports.getFriends = (email, callback) => {
	var query = {email: email};
    User.find(query, {friends: 1, _id: 0}, callback)
}

//get block list 
module.exports.getBlockList = (email, callback) => {
	var query = {email: email};
    User.find(query, {block: 1, _id: 0}, callback)
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
module.exports.subscribe = (requestor, target, callback) => {
	var query = {email: requestor};
	var update = {$addToSet : {subscribe : target}};
	User.findOneAndUpdate(query, update, {new: true}, callback);
} 

// block
module.exports.block = (requestor, target, callback) => {
	var query = {email: requestor};
	var update = {$addToSet : {block : target}};

	User.findOneAndUpdate(query, update, {new: true}, callback);
}

module.exports.removeSubscribe = (requestor, target, callback) => {
	var query = {email: requestor};
	var update = {$pull : {subscribe : target}};

	User.findOneAndUpdate(query, update, {new: true}, callback);
}

module.exports.removeRecipients = (requestor, target, callback) => {
	var query = {email: requestor};
	var update = {$pull : {follower : target}};

	User.findOneAndUpdate(query, update, {new: true}, callback);
}

module.exports.addFollower = (requestor, target, callback) => {
	var query = {email: requestor};
	var update = {$addToSet : {follower : target}};

	User.findOneAndUpdate(query, update, {new: true}, callback);
}

//get recipient list
module.exports.getRecipientList = (sender, text, callback) => {
	var recipientList = [];
	var query = {email: sender};
	var emails = checkIfEmailInString(text);

	if(typeof(emails) != 'undefined' && emails != null) {
		emails.forEach(function(email) {
			recipientList.push(email);
		});
	}
	
	if (recipientList.length !== 0) {
		var update = {$addToSet : {follower: recipientList}};
		User.findOneAndUpdate(query, update, {new: true}, callback);
	} else {
		User.find(query, {follower: 1, _id: 0}, callback);
	}
} 

var checkIfEmailInString = function (text) { 
    var regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return text.match(regex);
}