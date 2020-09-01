const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
var JSAlert = require("js-alert");
const app = express()
const connectionString = process.env.CONNECTION_STRING;
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const TodoTask = require("./models/TodoTask.js");
const { ObjectID } = require('mongodb');
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/static', express.static("public"))
const MongoClient = require("mongodb").MongoClient;
app.listen(3000, () => { console.log('App is running in port 3000!! ') })
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then((client) => {
        const db = client.db("To-Do-Application");
        var simple_messages;
        var passcode;
        app.get("/", (req, res) => {
            res.render("todoChoice.ejs");
        });
        app.get("/login", (req, res) => {
            res.render("todoLogin.ejs")
        });
        app.get("/register", (req, res) => {
            res.render("todoRegister.ejs")
        });
        app.get("/signup_account", (req, res) => {
            simple_messages
                .find()
                .toArray()
                .then((results) => {
                    res.render("todo.ejs", { content: results });
                })
                .catch((error) => console.error(error));
        })
        app.post("/signup_account", (req, res) => {
            passcode = req.body.name + req.body.password;
            db.listCollections({ name: passcode })
                .next(function(err, collinfo) {
                    if (collinfo) {
                        res.render("todoRegister-alert");
                    } else {
                        simple_messages = db.collection(passcode);
                        simple_messages
                            .find()
                            .toArray()
                            .then((results) => {
                                res.render("todo.ejs", { content: results });
                            })
                            .catch((error) => console.error(error));
                    }

                });
        })
        app.post("/login_account", (req, res) => {
            passcode = req.body.name + req.body.password;
            db.listCollections({ name: passcode })
                .next(function(err, collinfo) {
                    if (!collinfo) {
                        res.render("todoLogin-alert")
                    } else {
                        simple_messages = db.collection(passcode);
                        simple_messages
                            .find()
                            .toArray()
                            .then((results) => {
                                res.render("todo.ejs", { content: results });
                            })
                            .catch((error) => console.error(error));
                    }

                });
        })
        app.post("/", (req, res) => {
            simple_messages = simple_messages = db.collection(passcode);
            simple_messages
                .insertOne(req.body)
                .then((result) => {
                    simple_messages
                        .find()
                        .toArray()
                        .then((results) => {
                            res.render("todo.ejs", { content: results });
                        })
                        .catch((error) => console.error(error));
                })
                .catch((error) => console.log(error));
        });
        app
            .route("/edit/:id")
            .get((req, res) => {
                const id = req.params.id;
                res.render("todoEdit.ejs", { idTask: id });
            })
            .post((req, res) => {
                const id_val = req.params.id;
                const queryvalue = { _id: ObjectID(id_val) };
                const new_val = { $set: { content: req.body.content } };
                simple_messages.updateOne(queryvalue, new_val, function(error, res) {})
                simple_messages
                    .find()
                    .toArray()
                    .then((results) => {
                        res.render("todo.ejs", { content: results });
                    })
                    .catch((error) => console.error(error));

            });
        app.route("/remove/:id").get((req, res) => {
            simple_messages = simple_messages = db.collection(passcode);
            const id_val = req.params.id;
            const queryvalue = { _id: ObjectID(id_val) };
            simple_messages.remove(queryvalue, function(err, obj) {
                if (err) throw err;
                else {
                    simple_messages
                        .find()
                        .toArray()
                        .then((results) => {
                            res.render("todo.ejs", { content: results });
                        })
                        .catch((error) => console.error(error));
                }
            });

        });
    })
    .catch((error) => console.error(error));