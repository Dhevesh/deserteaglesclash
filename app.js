const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const rp = require("request-promise");
const mongoose = require("mongoose");

const User = require("./models/user");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/clash_db", { useNewUrlParser : true });

var clanTag = encodeURIComponent("#VOPVRCRG");
var playerTag;
const token = process.env.CLASHAPITOKEN;

var myClan = {
    uri: 'https://api.clashofclans.com/v1/clans/'+clanTag,
    qs: {
        Authorization: token
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
};

// ROUTES
// INDEX
app.get("/",(req,res)=>{
    res.redirect("/home");
});

app.get("/home",(req,res)=>{
    rp(myClan)
    .then((clan)=>{
        res.render("index",{clan:clan})
    })
    .catch((err)=>{
        console.log(err);
    });
});
app.get("/members",(req,res)=>{
    rp(myClan)
    .then((clan)=>{
        res.render("members",{clan:clan})
    })
    .catch((err)=>{
        console.log(err);
    });
});

// SHOW ROUTE
app.get("/members/:id",(req,res)=>{
    playerTag = encodeURIComponent(req.params.id);
    var player = {
        uri: 'https://api.clashofclans.com/v1/players/'+playerTag,
        qs: {
            Authorization: token
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    rp(player)
        .then((foundPlayer)=>{
            res.render("show",{player:foundPlayer});
        })
        .catch(err=>console.log(err));
});

// USER ROUTES
// CREATE
app.get("/register", (req, res)=>{
    res.render("register");
});

app.post("/register", (req, res)=>{
    User.create(req.body.member, (err, newUser)=>{
        if (!err){
            console.log(newUser);
            res.redirect("/home");
        } else{
            console.log("could not create new user");
            console.log(err);
        }
    })
    //res.redirect("/home");
    
});




// ALL OTHER ROUTES
app.get("*",(req,res)=>{
    res.render("error");
});

// LISTEN ROUTE
var port = process.env.PORT || 3000;
app.listen(port, process.env.IP,()=>{
    console.log("app started on port:",port);
});