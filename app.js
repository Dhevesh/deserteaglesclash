const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise');
const mongoose = require('mongoose');
const fs = require('fs');
const apiKey_one =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjFkMzBhYmRmLTdjMzgtNGQ4NC04Y2Y4LTU3ZTJkZmE5ZjRmMCIsImlhdCI6MTY3MzM1OTUyOSwic3ViIjoiZGV2ZWxvcGVyLzk1NTBhOWQ1LTExZjgtYTFmYy1jYzk2LTU5NzVhOGEyMWMwNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjAuMC4wLjAiXSwidHlwZSI6ImNsaWVudCJ9XX0.Ijd5lv0V9BrBla38qc7okj0rK__K5ukmnIC2tmqboccXfs5_RkQLKSrB3A-c8CbyX_w-543j50a1gNVIILTgNw';
const apiKey_two =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhkNzI5OTg1LTkzY2QtNGM1Yy1iMTNmLTdlMDU4NzczNjZkOCIsImlhdCI6MTY3MTU2NzY3OCwic3ViIjoiZGV2ZWxvcGVyLzk1NTBhOWQ1LTExZjgtYTFmYy1jYzk2LTU5NzVhOGEyMWMwNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQxLjI0Ni4zMS4xOTIiXSwidHlwZSI6ImNsaWVudCJ9XX0.41_gFa-_dMr5GVX3L64IggxwOeZIcy5DPvOxr6NyxsD9MeXPM8iOJZrY9eoBhKPgVy-VernG5cv_lzSP0jFvuA';

const User = require('./models/user');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
//mongoose.connect("mongodb://localhost:27017/clash_db", { useNewUrlParser : true });

//var clanTag = encodeURIComponent("#VOPVRCRG");
// var clanTag = encodeURIComponent('#QUL9UVR2');
var clanTag;
app.locals.clanTag = '';
app.locals.playerTag = '';
var playerTag;
const token = `Bearer ${apiKey_one}`;

var leagues = {
	uri: 'https://api.clashofclans.com/v1/leagues/',
	qs: {
		Authorization: token,
	},
	headers: {
		'User-Agent': 'Request-Promise',
	},
	json: true,
};

const assets = require('./models/assets.json');

// ROUTES
// INDEX
app.get('/', (req, res) => {
	res.redirect('/search');
});

app.get('/search', (req, res) => {
	res.render('clanSearch');
});

app.post('/search', function (req, res) {
	if (req.body.clan != '') {
		app.locals.clanTag = encodeURIComponent(`${req.body.clan}`);
		clanTag = encodeURIComponent(`${req.body.clan}`);
		var searchClan = {
			uri: 'https://api.clashofclans.com/v1/clans/' + app.locals.clanTag,
			qs: {
				Authorization: token,
			},
			headers: {
				'User-Agent': 'Request-Promise',
			},
			json: true,
		};
		rp(searchClan).then((clan) => {
			rp(leagues)
				.then((league) => {
					res.render('home', { clan: clan, leagues: league });
				})
				.catch((err) => {
					res.redirect('/search');
				});
		});
	} else {
		res.redirect('/search');
	}
});

app.get('/home', function (req, res) {
	app.locals.clanTag = '%23QUL9UVR2';
	var myClan = {
		uri: 'https://api.clashofclans.com/v1/clans/' + app.locals.clanTag,
		qs: {
			Authorization: token,
		},
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	};
	rp(myClan)
		.then((clan) => {
			rp(leagues).then((league) => {
				res.render('home', { clan: clan, leagues: league });
			});
		})
		.catch((err) => {
			console.log(err);
		});
	// res.render('home', { clan: clan, leagues: league });
});
app.get('/members', (req, res) => {
	var memberClan = {
		uri: 'https://api.clashofclans.com/v1/clans/' + app.locals.clanTag,
		qs: {
			Authorization: token,
		},
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	};
	rp(memberClan)
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
			res.render('./player/player_home', { player: foundPlayer, assets: assets });
		})
		.catch((err) => console.log(err + 'new_error'));
});

app.post('/members', (req, res) => {
	app.locals.playerTag = encodeURIComponent(`${req.body.player}`);
	var searchPlayer = {
		uri: 'https://api.clashofclans.com/v1/players/' + app.locals.playerTag,
		qs: {
			Authorization: token,
		},
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	};
	rp(searchPlayer).then((foundPlayer) => {
		res.render('./player/player_home', { player: foundPlayer, assets: assets });
	});
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
var port = process.env.PORT || 8000;
app.listen(port, process.env.IP, () => {
	console.log('app started on port:', port);
});
