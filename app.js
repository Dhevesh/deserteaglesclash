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
const token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjNmMzNjYzEzLTA5MjctNDQyOC04MDJjLWM1MmYwNzIyMGQxNiIsImlhdCI6MTU2NjA4Mjc2MSwic3ViIjoiZGV2ZWxvcGVyLzk1NTBhOWQ1LTExZjgtYTFmYy1jYzk2LTU5NzVhOGEyMWMwNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjM3LjIyOC4yNDIuOTAiXSwidHlwZSI6ImNsaWVudCJ9XX0.PtSZwWR2fBm1r7XYWvyPBYxkA5SADlaKan9vS-PqDlS12Tt_lx090od-8BRbBLiXUdaf-0wNINhLh7N3ndmz-A";

var clanTag = encodeURIComponent("#VOPVRCRG");
var playerTag;

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
app.listen(3000, process.env.IP,()=>{
    console.log("app started on port 3000");
});