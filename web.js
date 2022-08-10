// ###################################################################################
// ## START IMPORT
// ## Library
import bodyParser from "body-parser";
import express from 'express';
import session from 'express-session';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ################

// import { refreshByWeb } from './comptaHome.js';
import * as webhookDiscord from './www/html/assets/js/webhook_func.js';

// ## END IMPORT
// ###################################################################################

const app = express();
const port = 20038;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(session({
	secret: '001/011100110110010101100011011100100110010101110100',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(haltOnTimedout);

app.listen(port, () => {
    console.log(`Panel Web app listening at http://mars.projectheberg.com:${port}`);
})

function uuidGen(count) {
    var founded = false;
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';

    for(var i = 0; i < count; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }

    return str;
}

var timeoutSession = [];

function haltOnTimedout(req, res, next) {
    if (req.session.loggedin) {
        if (!req.session.uuid) req.session.uuid = "$1/"+uuidGen(3)+"."+uuidGen(11);

        clearTimeout(timeoutSession[req.session.uuid]);

        timeoutSession[req.session.uuid] = setTimeout(function() {
            webhookDiscord.authOut(req.session.fname+" "+req.session.lname);
            req.session.destroy();
            return;
        }, 300000); // 5 minutes = 300000 ms
    }
    next();
}

// ###################################################################################
// ## START GET REQUEST
app.get('/auth', async (req, res) => {
    var data = fs.readFileSync(__dirname + "/www/html/login.html", { encoding: 'utf8' });

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(data);
})

app.get('/', async (req, res) => {
    if (req.session.loggedin) {
        var data = fs.readFileSync(__dirname + "/www/html/index.html", { encoding: 'utf8' });

		res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(data);
	} else {
		res.redirect('/auth');
	}
})

app.get('/changelog', async (req, res) => {
    // var data = getDataFile(__dirname + "/www/html/changelog.html");
    var data = fs.readFileSync(__dirname + "/www/html/changelog.html", { encoding: 'utf8' });

    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(data);
})

app.get('/inventaire', async (req, res) => {
    // var data = getDataFile(__dirname + "compta.json");
    var data = fs.readFileSync(__dirname + "/compta.json", { encoding: 'utf8' });

    res.setHeader("Content-Type", "text/json");
    res.writeHead(200);
    res.end(data);
})

app.get('/getPseudoById', async (req, res) => {
    // var data = getDataFile(__dirname + "authPass.db");
    var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

    try {
        let myObj = JSON.parse(data);

        let _rtn = (myObj.authList[req.query.id].pseudo)? myObj.authList[req.query.id].pseudo:myObj.authList[req.query.id].firstname+" "+myObj.authList[req.query.id].lastname;

        res.setHeader("Content-Type", "text/html");
        res.writeHead(202);
        res.end(_rtn);
    } catch (err) {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(204);
        res.end("{user supprimé}");
    }
})

app.get('/favicon.ico', async (req, res) => {
    var data = fs.readFileSync(__dirname + "/www/html/favicon.ico");
    
    res.setHeader("Content-Type", "image/x-icon");
    res.writeHead(200);
    res.end(data);
})

app.get('/assets/css/style.css', async (req, res) => {
    var data = fs.readFileSync(__dirname + "/www/html/assets/css/style.css");
    
    res.setHeader("Content-Type", "text/css");
    res.writeHead(200);
    res.end(data);
})

app.get('/assets/css/style.login.css', async (req, res) => {
    var data = fs.readFileSync(__dirname + "/www/html/assets/css/style.login.css");

    res.setHeader("Content-Type", "text/css");
    res.writeHead(200);
    res.end(data);
})

app.get('/assets/js/app-angular.js', async (req, res) => {
    var data = fs.readFileSync(__dirname + "/www/html/assets/js/app-angular.js");

    res.setHeader("Content-Type", "application/javascript");
    res.writeHead(200);
    res.end(data);
})

app.get('/logout', async (req, res) => {
    if (req.session.loggedin) {
		webhookDiscord.authOut(req.session.fname+" "+req.session.lname);

        req.session.destroy(function(err) {
            res.redirect('/auth');
        })
	} else {
		res.redirect('/');
	}
})
// ## END GET REQUEST
// ###################################################################################

// ###################################################################################
// ## START POST REQUEST
app.post('/savejson', async (req, res) => {
    try {
        let myObj = JSON.parse(req.body.action);

        webhookDiscord.toLogs(req.body.logs, req.body.section, req.session.fname+" "+req.session.lname);

        for (let i = 1; i <= Object.keys(myObj.list[req.body.section]).length-2; i++) {
            delete myObj.list[req.body.section][i].tmp;
            // delete myObj.list[req.body.section][i].uuid;
        }

        fs.writeFileSync(__dirname + "/compta.json", JSON.stringify(myObj), { encoding: 'utf8' })
        .then(contents => {
            // refreshByWeb();
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

app.post('/saveprofile', async (req, res) => {
    try {
        let myPostObj = JSON.parse(req.body.action);

        webhookDiscord.toLogsProfile(myPostObj, req.session.fname+" "+req.session.lname);

        const data = JSON.parse(fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' }));
        
        for (let i = 0; i < data.authList.length; i++) {
            if (data.authList[i].id == myPostObj.id) {
                
                data.authList[i].date_modif = moment().add(2, "Hours").unix();
                data.authList[i].modif_name = myPostObj.pseudo;
                data.authList[i].firstname = myPostObj.firstname;
                data.authList[i].lastname = myPostObj.lastname;
                data.authList[i].pseudo = myPostObj.pseudo;
                data.authList[i].permission = myPostObj.permission;
                data.authList[i].grade = myPostObj.grade;
                data.authList[i].group = myPostObj.group;
            }
        }

        req.session.fname = myPostObj.firstname;
        req.session.lname = myPostObj.lastname;
        req.session.pseudo = myPostObj.pseudo;
        req.session.group = myPostObj.group;
        req.session.grade = myPostObj.grade;
        req.session.permission = myPostObj.permission;

        fs.writeFileSync(__dirname + "/authPass.db", JSON.stringify(data), { encoding: 'utf8' });

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end("success");
    } catch (error) {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(500);
        res.end(error);
    }
})

app.post('/auth', async (req, res) => {
    var floatingCode = String(req.body.floatingCode).toLowerCase();

	if (floatingCode) {
        var myObj = false;

        var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

        myObj = JSON.parse(data);
        var _return = false;
        var _returnId = false;
        var _returnFName = false;
        var _returnLName = false;
        var _returnPseudo = false;
        var _returnGroup = false;
        var _returnGrade = false;
        var _returnPerm = false;

        for (let i=0; i < myObj.authList.length; i++) {
            if (myObj.authList[i]["pwd"] == floatingCode) {
                _return = true;
                _returnId = myObj.authList[i]["id"].toString();
                _returnFName = myObj.authList[i]["firstname"];
                _returnLName = myObj.authList[i]["lastname"];
                _returnPseudo = myObj.authList[i]["pseudo"];
                _returnGroup = myObj.authList[i]["group"];
                _returnGrade = myObj.authList[i]["grade"].toString();
                _returnPerm = myObj.authList[i]["permission"].toString();
            }
        }

        if (_return) {
            webhookDiscord.auth(_returnFName+" "+_returnLName);

            req.session.loggedin = true;
            req.session.iduser = _returnId;
            req.session.fname = _returnFName;
            req.session.lname = _returnLName;
            req.session.pseudo = _returnPseudo;
            req.session.group = _returnGroup;
            req.session.grade = _returnGrade;
            req.session.permission = _returnPerm;

            req.session.timeout = 0;
            // return request POST
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end('true');
        } else {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(203);
            res.end('Incorrect Username and/or Password!');
        }
	} else {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(203);
		res.end("Connexion user in progress!");
	}
})

app.post('/userManagement', async (req, res) => {
    var action = String(req.body.action);

    if (!req.session.loggedin || req.session.permission == "0") {
        action = false;

        res.setHeader("Content-Type", "text/html");
        res.writeHead(203);
        res.end("Permission non approuvé");
        return;
	}
    // ///////////////////////////////////////////////////////////////////////////////////////
    // A Vérifié
    
    switch (action) {
        case "getlist":
            var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

            try {
                let myObj = JSON.parse(data);

                res.setHeader("Content-Type", "text/json");
                res.writeHead(202);
                res.end(JSON.stringify(myObj.authList));
            } catch (err) {
                res.setHeader("Content-Type", "text/json");
                res.writeHead(204);
                res.end("{}");
            }
            break;
        case "deleteuser":
            var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

            webhookDiscord.toLogsDeleteProfile(req.body.id, req.session.fname+" "+req.session.lname);

            try {
                let myObj = JSON.parse(data);
                delete myObj.authList[req.body.id];

                let i = 0;
                for (let key of Object.keys(myObj.authList)) {
                    myObj.authList[key].id = i;
                    myObj.authList[i] = myObj.authList[key];
                    i++;
                }
                myObj.authList.pop();

                fs.writeFileSync(__dirname + "/authPass.db", JSON.stringify(myObj), { encoding: 'utf8' })
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

            break;
        case "edituser":
            var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

            webhookDiscord.toLogsEditProfile({"id": req.body.id, "firstname": req.body.firstname, "lastname": req.body.lastname, "pseudo": req.body.pseudo, "group": req.body.group, "grade": req.body.grade, "permission": ((req.body.permission == "true")? 1:0)}, req.session.fname+" "+req.session.lname);

            try {
                let myObj = JSON.parse(data);

                myObj.authList[req.body.id].date_modif      = moment().add(2, "Hours").unix();
                myObj.authList[req.body.id].modif_id        = req.session.iduser;
                myObj.authList[req.body.id].pwd             = req.body.pwd;
                myObj.authList[req.body.id].firstname       = req.body.firstname;
                myObj.authList[req.body.id].lastname        = req.body.lastname;
                myObj.authList[req.body.id].pseudo          = req.body.pseudo;
                myObj.authList[req.body.id].group           = req.body.group;
                myObj.authList[req.body.id].grade           = req.body.grade;
                myObj.authList[req.body.id].permission      = req.body.permission;

                fs.writeFileSync(__dirname + "/authPass.db", JSON.stringify(myObj), { encoding: 'utf8' })
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

            break;
        case "addUser":
            var data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

            webhookDiscord.toLogsAddProfile({"firstname": req.body.firstname, "lastname": req.body.lastname, "pseudo": req.body.pseudo, "group": req.body.group, "grade": req.body.grade, "permission": ((req.body.permission == "true")? 1:0)}, req.session.fname+" "+req.session.lname);

            try {
                let myObj = JSON.parse(data);

                let sizeObj = myObj.authList.length;

                myObj.authList[sizeObj]                = {};
                myObj.authList[sizeObj].id             = sizeObj;
                myObj.authList[sizeObj].date_create    = moment().add(2, "Hours").unix();
                myObj.authList[sizeObj].date_modif     = moment().add(2, "Hours").unix();
                myObj.authList[sizeObj].modif_id       = req.session.iduser;
                myObj.authList[sizeObj].pwd            = req.body.pwd;
                myObj.authList[sizeObj].firstname      = req.body.firstname;
                myObj.authList[sizeObj].lastname       = req.body.lastname;
                myObj.authList[sizeObj].pseudo         = req.body.pseudo;
                myObj.authList[sizeObj].group          = req.body.group;
                myObj.authList[sizeObj].grade          = req.body.grade;
                myObj.authList[sizeObj].permission     = req.body.permission;

                fs.writeFileSync(__dirname + "/authPass.db", JSON.stringify(myObj), { encoding: 'utf8' })
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
            break;
        default:
            res.setHeader("Content-Type", "text/html");
            res.writeHead(203);
            res.end("Command not found.");
            break;
    }
})

app.post('/getSession', (req, res) => {
    res.setHeader('Content-Type', 'text/json');
    res.writeHead(202);
    res.end(JSON.stringify(req.session));
})

app.post('/getProfile', async (req, res) => {
    const data = fs.readFileSync(__dirname + "/authPass.db", { encoding: 'utf8' });

    var myObj = JSON.parse(data);

    var remIndex = false;
    for (let i = 0; i < myObj.authList.length; i++) {
        if (myObj.authList[i].id == req.session.iduser) {
            remIndex = i;

            myObj.authList[i].pwd = "*****";
            myObj.authList[i].modif_name = (myObj.authList[i].pseudo)? myObj.authList[i].pseudo:myObj.authList[i].firstname+" "+myObj.authList[i].lastname;

            res.setHeader('Content-Type', 'text/json');
            res.writeHead(202);
            res.end(JSON.stringify(myObj.authList[i]));

            break;
        }
    }
})
// ## END POST REQUEST
// ###################################################################################

export default app;