const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require('validator');

app.use(bodyParser.json());

User = require('./models/user');

// Connect to Mongoose
mongoose.connect('mongodb://mongodb:27017/user');
var db = mongoose.connection;

app.post('/friend', (req, res) => {
    var result = validateReqTar(req.body.friends[0], req.body.friends[1]);

    if (result.success === true) {
        User.getBlockList(req.body.friends[0], (err, data) => {
            var blockList = (data.length > 0 ) ? data[0].block : [];
            if (!blockList.includes(req.body.friends[1])) {
                User.connectFriend(req.body.friends, (err, response) => {
                    if(err) {
                        throw err;
                    }
                });
                for (var i=0; i<=req.body.friends.length-1; i++) {
                    User.subscribe(req.body.friends[i], req.body.friends[1-i], (err, response) => {
                        if(err) {
                            throw err;
                        }
                    });
                    User.addFollower(req.body.friends[1-i], req.body.friends[i], (err, response) => {
                        if(err) {
                            throw err;
                        }
                    });
                }
                res.json({success: true});
            } else {
                res.json({success: false, reason: "In block list."})
            }

        })

    } else {
        res.json(result.reason);
    }
});

app.post('/friend/list', (req, res) => {
    var email = req.body.email;
    var result = validateEmail(email);

    if(result.success === true) {
        User.getFriends(email, (err, friends) => {
            if(err) {
                throw err;
            }
    
            var friendsList = (friends.length > 0 ) ? friends[0].friends : [];
            res.json({ success: true, friends: friendsList, count: friends.length });
        });
    } else {
        res.json(result);
    }

});

app.post('/friend/common', (req, res) => {
    var result = validateReqTar(req.body.friends[0], req.body.friends[1]);

    if (result.success === true) {
        User.getCommonFriends(req.body.friends, (err, friends) => {
            if(err) {
                throw err;
            }
            
            var friendsList = (friends.length > 0 ) ? friends[0].result : "";
            res.json({ success: true, friends: friendsList, count: friends.length });
        });
    } else {
        res.json(result.reason);
    }
});

app.post('/subscribe', (req, res) => {
    var result = validateReqTar(req.body.requestor, req.body.target);
    if (result.success === true) {
        User.subscribe(req.body.requestor, req.body.target, (err, friends) => {
            if(err) {
                throw err;
            }
            User.addFollower(req.body.target, req.body.requestor, (err, followers) => {
                if(err) {
                    throw err;
                }
            });
        });
        res.json({ success: true });
    } else {
        res.json(result.reason);
    }
});

app.post('/block', (req, res) => {
    var validateResult = validateReqTar(req.body.requestor, req.body.target);
    if (validateResult.success === true) {
        User.block(req.body.requestor, req.body.target, (err, friends) => {
            if(err) {
                throw err;
            }
            User.removeSubscribe(req.body.requestor, req.body.target, (err, subscribers) => {
                if(err) {
                    throw err;
                }
            });
        });
        res.json({ success: true });
    } else {
        res.json(validateResult.reason);
    }
});

app.post('/recipient', (req, res) => {
    var result = validateEmail(req.body.sender);
    if (result.success === true) {
        User.getRecipientList(req.body.sender, req.body.text, (err, recipientList) => {
            if(err) {
                throw err;
            }
            if (recipientList instanceof Array) {
                res.json({ success: true, recipients: recipientList[0].follower});
            } else {
                res.json({ success: true, recipients: recipientList.follower});
            }
        });
    } else {
        res.json(result.reason);
    }
});

app.listen(3000);
console.log('Running on port 3000...');

var validateEmail = function (email) {
    if (!email)
        return { success: false, reason: "email cannot be null or empty" };
    if (!validator.isEmail(email))
        return { success: false, reason: "incorrect email format" };

    return { success: true };
};

var checkIfEmailInString = function (text) {
    var regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    return text.match(regex);
}

var validateReqTar = function (emailReq, emailTar) {
    // Check if value are empty or null
    if(!emailReq)
        return { success: false, reason: "requestor email cannot be null or empty" };
    if(!emailTar)
        return { success: false, reason: "target email cannot be null or empty" };

    // Check if duplicate email
    if(validator.equals(emailReq, emailTar))
        return { success: false, reason: "requestor email and target email cannot be same" };

    // Check if email are valid
    if (!validator.isEmail(emailReq))
        return { success: false, reason: "incorrect requestor email format" };
    if (!validator.isEmail(emailTar))
        return { success: false, reason: "incorrect target email format" };

    return { success: true };
};