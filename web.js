const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const { refreshByWeb } = require('./comptaHome.js');
const fs = require('fs').promises;

const app = express();
const port = 20038;

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Example app listening at http://zeta.projectheberg.fr:${port}`)
})

// ###########
// REQUEST
// GET
app.get('/auth', (req, res) => {
    fs.readFile(__dirname + "/www/html/login.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
})

app.get('/', (req, res) => {
    if (req.session.loggedin) {
		fs.readFile(__dirname + "/www/html/index.html")
            .then(contents => {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
            })
	} else {
		res.redirect('/auth');
	}
})

app.get('/inventaire', (req, res) => {
    fs.readFile(__dirname + "/compta.json")
        .then(contents => {
            res.setHeader("Content-Type", "text/json");
            res.writeHead(200);
            res.end(contents);
        })
})

app.get('/assets/css/style.css', (req, res) => {
    fs.readFile(__dirname + "/www/html/assets/css/style.css")
        .then(contents => {
            res.setHeader("Content-Type", "text/css");
            res.writeHead(200);
            res.end(contents);
        })
})

app.get('/assets/css/style.login.css', (req, res) => {
    fs.readFile(__dirname + "/www/html/assets/css/style.login.css")
        .then(contents => {
            res.setHeader("Content-Type", "text/css");
            res.writeHead(200);
            res.end(contents);
        })
})

app.get('/assets/js/app-angular.js', (req, res) => {
    fs.readFile(__dirname + "/www/html/assets/js/app-angular.js")
        .then(contents => {
            res.setHeader("Content-Type", "text/css");
            res.writeHead(200);
            res.end(contents);
        })
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/auth');
    })
})

// ###########
// REQUEST
// POST
app.post('/savejson', (req, res) => {
    try {
        fs.writeFile(__dirname + "/compta.json", req.body.action)
        .then(contents => {
            refreshByWeb();
        });

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end("success");
    } catch (error) {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(500);
        res.end(error);
    }
})

app.post('/auth', (req, res) => {
    var floatingCode0 = String(req.body.floatingCode0).toLowerCase();
	var floatingCode1 = String(req.body.floatingCode1).toLowerCase();
	var floatingCode2 = String(req.body.floatingCode2).toLowerCase();
	var floatingCode3 = String(req.body.floatingCode3).toLowerCase();
	var floatingCode4 = String(req.body.floatingCode4).toLowerCase();

	if (floatingCode0 && floatingCode1 && floatingCode2 && floatingCode3 && floatingCode4) {
        var myObj = false;

        fs.readFile('./authPass.json').then(contents => {
            myObj = JSON.parse(contents);
            var _return = false;
            var _returnName = false;

            for (let i=0; i < myObj.authList.length; i++) {
                if (myObj.authList[i]["pwd"] == floatingCode0+floatingCode1+floatingCode2+floatingCode3+floatingCode4) {
                    _return = true;
                    _returnName = myObj.authList[i]["name"];
                    _returnPermission = myObj.authList[i]["permission"];
                }
            }

            if (_return) {
                req.session.loggedin = true;
                req.session.username = _returnName;
                req.session.permission = _returnPermission;
                res.redirect('/');
            } else {
                res.send('1 | Incorrect Username and/or Password!');
            }
        });
	} else {
		res.send("2 | Connexion user in progress!");
		res.end();
	}
})

app.post('/userManagement', (req, res) => {
    var action = String(req.body.action);

    if (!req.session.loggedin || req.session.permission == "0") {
        action = false;

        res.setHeader("Content-Type", "text/html");
        res.writeHead(203);
        res.end("Permission non approuvé");
        return;
	}

    switch (action) {
        case "getlist":
            fs.readFile(__dirname + "/authPass.json")
                .then(contents => {
                    try {
                        myObj = JSON.parse(contents);

                        res.setHeader("Content-Type", "text/json");
                        res.writeHead(202);
                        res.end(JSON.stringify(myObj.authList));
                    } catch (err) {
                        res.setHeader("Content-Type", "text/json");
                        res.writeHead(204);
                        res.end("{}");
                    }
                })
            break;
        case "deleteuser":
            fs.readFile(__dirname + "/authPass.json")
            .then(contents => {
                try {
                    myObj = JSON.parse(contents);

                    delete myObj.authList[req.body.id];

                    let i = 0;
                    for (let key of Object.keys(myObj.authList)) {
                        myObj.authList[key].id = i;
                        myObj.authList[i] = myObj.authList[key];
                        i++;
                    }
                    myObj.authList.pop();

                    console.log(myObj);

                    fs.writeFile(__dirname + "/authPass.json", JSON.stringify(myObj))
                    .then(contents => {
                        res.setHeader("Content-Type", "text/html");
                        res.writeHead(201);
                        res.end("OK");
                    });
                } catch (err) {
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(203);
                    res.end(err);
                }
            })
            break;
        case "edituser":
            fs.readFile(__dirname + "/authPass.json")
            .then(contents => {
                try {
                    myObj = JSON.parse(contents);

                    myObj.authList[req.body.id].name       = req.body.name
                    myObj.authList[req.body.id].pwd        = req.body.pwd
                    myObj.authList[req.body.id].permission = (req.body.permission == "true")? 1:0;

                    fs.writeFile(__dirname + "/authPass.json", JSON.stringify(myObj))
                    .then(contents => {
                        res.setHeader("Content-Type", "text/html");
                        res.writeHead(201);
                        res.end("OK");
                    });
                } catch (err) {
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(204);
                    res.end(err);
                }
            })
            break;
        case "addUser":
            fs.readFile(__dirname + "/authPass.json")
            .then(contents => {
                try {
                    myObj = JSON.parse(contents);

                    let sizeObj = myObj.authList.length;

                    myObj.authList[sizeObj]            = {};
                    myObj.authList[sizeObj].id         = sizeObj;
                    myObj.authList[sizeObj].name       = req.body.name;
                    myObj.authList[sizeObj].pwd        = req.body.pwd;
                    myObj.authList[sizeObj].permission = (req.body.permission == "true")? 1:0;

                    fs.writeFile(__dirname + "/authPass.json", JSON.stringify(myObj))
                    .then(contents => {
                        res.setHeader("Content-Type", "text/html");
                        res.writeHead(201);
                        res.end("OK");
                    });
                } catch (err) {
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(203);
                    res.end(err);
                }
            })
            break;
        default:
            res.setHeader("Content-Type", "text/html");
            res.writeHead(203);
            res.end("Command not found.");
            break;
    }
})

app.post('/getSession', (req, res) => {
    res.setHeader('Content-Type', 'text/json')
    res.write(JSON.stringify(req.session))
    res.end()
})
