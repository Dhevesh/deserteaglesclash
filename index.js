const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const rp = require('request-promise');
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config()

const clash_key = process.env.api_key;


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
const token = `Bearer ${clash_key}`;

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
/* app.get('/', (req, res) => {
	res.redirect('/search');
}); */

app.get('/', (req, res)=>res.send("Express on Vercel"));

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
