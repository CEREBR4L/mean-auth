var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./models/users');

var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
	res.send('Hello the api is on port: ' + port);
});

app.get('/setup', function(req, res){

	var nick = new User({
		name: 'Nick Meme',
		password: 'lolwhoevnkno',
		admin: true
	});

	nick.save(function(err){
		if(err) throw err;

		console.log('USER SAVED ALL GOOD GOOD');
		res.json({ success: true });

	});

});

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res){
	User.findOne({ name: req.body.name }, function(err, user){
		if(err) throw err;

		if(!user){
			res.json({ success: false, message: "Failed to find user" });
		}
		else if(user){

			if(user.password!=req.body.password){
				res.json({ success: false, message: "Password incorrect" })
			}
			else{
				
				var token = jwt.sign({name: user.name}, app.get('superSecret'), {});

				res.json({
					success: true,
					message: 'ERE AVE A TOKEN KID',
					token: token
				});

			}
		}
	});
});

apiRoutes.use(function(req, res, next){

	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token){

		jwt.verify(token, app.get('superSecret'), function(err, decoded){
			if(err){ 
				return res.json({ success: false, message: 'Invalid token' })
			}
			else{
				req.decoded = decoded;
				next();
			}
		});

	}
	else{

		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}

})

apiRoutes.get('/', function(req, res){
	res.json({ message: 'Welcome to some API lol' });
});

apiRoutes.get('/users', function(req, res){
	User.find({}, function(err, users){
		res.json(users);
	});
});

app.use('/api', apiRoutes);


app.listen(port);
console.log("Magic has started this up, honest. Either way we workin' baby!");

