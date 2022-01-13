const express = require('express');
const { refreshByWeb } = require('./comptaHome.js');
const fs = require('fs').promises;

const app = express()
const port = 20292

app.use(express.json());

// ###########
// REQUEST
// GET
app.get('/login', (req, res) => {
    fs.readFile(__dirname + "/www/html/login.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

app.get('/', (req, res) => {
    fs.readFile(__dirname + "/www/html/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

app.get('/inventaire', (req, res) => {
    fs.readFile(__dirname + "/compta.json")
        .then(contents => {
            res.setHeader("Content-Type", "text/json");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
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

// app.get('/majDiscord', (req, res) => {
//     refreshByWeb();
//     res.setHeader("Content-Type", "text/html");
//     res.writeHead(200);
//     res.end("1");
// })

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

app.listen(port, () => {
    console.log(`Example app listening at http://zeta.projectheberg.fr:${port}`)
})