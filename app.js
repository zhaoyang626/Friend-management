const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require('validator');

app.use(bodyParser.json());

User = require('./models/user');

// Connect to Mongoose
mongoose.connect('mongodb://localhost/user');
var db = mongoose.connection;

app.post('/friend', (req, res) => {
    var requestor = req.body.friends[0];
    var target = req.body.friends[1];

    var requestorResult = validateEmail(requestor);
    var targetResult= validateEmail(target);

    if(requestorResult.success === true) {
        if(targetResult.success === true) {
            User.connectFriend(req.body.friends, (err, response) => {
                if(err) {
                    throw err;
                }
            });
            res.json({success: true});
        } else {
            res.json(targetResult);
        }
    } else {
        res.json(requestorResult);
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
    
            var friendsList = (friends.length > 0 ) ? friends[0].friends : "";
            res.json({ success: true, friends: friendsList, count: friends.length });
        });
    } else {
        res.json(result);
    }

});

app.post('/friend/common', (req, res) => {
    User.getCommonFriends(req.body.friends, (err, friends) => {
        if(err) {
            throw err;
        }

        var friendsList = (friends.length > 0 ) ? friends[0].result : "";
        res.json({ success: true, friends: friendsList, count: friends.length });
    });
});

app.post('/subscribe', (req, res) => {
    User.subscribe(req, (err, friends) => {
        if(err) {
            throw err;
        }
    });
    res.json({ success: true });
});

app.post('/block', (req, res) => {
    User.block(req, (err, friends) => {
        if(err) {
            throw err;
        }
    });
    res.json({ success: true });
});

app.post('/recipient', (req, res) => {
    User.getRecipientList(req, (err, recipientList) => {
        if(err) {
            throw err;
        }
        res.json(recipientList);
    });
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