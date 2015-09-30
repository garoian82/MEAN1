var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

router.param('userId', function (req, res, next, userId) {
	User.findById(userId, function (err, user) {
		console.log('THE USER ID IS: ', userId);
		if(err) return res.sendStatus(404)
		req.user = user;
		next();
	});
});

/* GET users listing. */
router.get('/', function(req, res) {
	User.find(function (err, users) {
		res.json(users);
	});
});

router.post('/', function (req, res) {
	var user = new User(req.body);
	user.save(function (err) {
		res.json(user);
	});
});

router.put('/:userId', function (req, res) {
	req.user.update({$set: req.body}, {new: true /*returns the updated version since by default it does not*/}, function (err, result) {
		res.sendStatus(200);
	});
});

module.exports = router;
