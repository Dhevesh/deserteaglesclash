const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise');
const mongoose = require('mongoose');

const User = require('./models/user');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
//mongoose.connect("mongodb://localhost:27017/clash_db", { useNewUrlParser : true });

//var clanTag = encodeURIComponent("#VOPVRCRG");
var clanTag = encodeURIComponent('#QUL9UVR2');
var playerTag;
const token =
	'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjY4MTRlMGI1LTVkNGMtNDhhNC1iYTkxLTgyZmNhY2VlMmYwZCIsImlhdCI6MTY2ODg4NjU4Niwic3ViIjoiZGV2ZWxvcGVyLzk1NTBhOWQ1LTExZjgtYTFmYy1jYzk2LTU5NzVhOGEyMWMwNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjEwMi4yNDguNzQuMTUiXSwidHlwZSI6ImNsaWVudCJ9XX0.2Ckr8MnHKqKz1i1JcCwcbpiYa3CxqzBmDjzHsOehKCMpBd_cqIfFJCxTYFx2mpzFYwzGeQF_JkI1QoAvdaQMDA';

var myClan = {
	uri: 'https://api.clashofclans.com/v1/clans/' + clanTag,
	qs: {
		Authorization: token,
	},
	headers: {
		'User-Agent': 'Request-Promise',
	},
	json: true,
};

// ROUTES
// INDEX
app.get('/', (req, res) => {
	res.redirect('/home');
});

app.get('/search', (req, res) => {
	res.render('clanSearch');
});

app.post('/search', function (req, res) {
	clanTag = encodeURIComponent(`#${req.body.clan}`);
	myClan = {
		uri: 'https://api.clashofclans.com/v1/clans/' + clanTag,
		qs: {
			Authorization: token,
		},
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	};

	res.render('home');
});

app.get('/home', function (req, res) {
	rp(myClan)
		.then((clan) => {
			res.render('home', { clan: clan });
		})
		.catch((err) => {
			console.log(err);
		});
});
app.get('/members', (req, res) => {
	rp(myClan)
		.then((clan) => {
			res.render('./clan/members', { clan: clan });
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW ROUTE
app.get('/members/:id', (req, res) => {
	playerTag = encodeURIComponent(req.params.id);
	var player = {
		uri: 'https://api.clashofclans.com/v1/players/' + playerTag,
		qs: {
			Authorization: token,
		},
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	};
	rp(player)
		.then((foundPlayer) => {
			res.render('./player/player_home', { player: foundPlayer });
		})
		.catch((err) => console.log(err));
});

// USER ROUTES
// CREATE
app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	User.create(req.body.member, (err, newUser) => {
		if (!err) {
			console.log(newUser);
			res.redirect('/home');
		} else {
			console.log('could not create new user');
			console.log(err);
		}
	});
	//res.redirect("/home");
});

// ALL OTHER ROUTES
app.get('*', (req, res) => {
	res.render('error');
});

// LISTEN ROUTE
var port = process.env.PORT || 8090;
app.listen(port, process.env.IP, () => {
	console.log('app started on port:', port);
});
