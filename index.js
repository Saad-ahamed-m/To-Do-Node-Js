const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config();
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
        const simple_messages = db.collection("To_Do_List");

        app.get("/", (req, res) => {
            simple_messages
                .find()
                .toArray()
                .then((results) => {
                    res.render("todo.ejs", { content: results });
                })
                .catch((error) => console.error(error));
        });
        app.post("/", (req, res) => {
            simple_messages
                .insertOne(req.body)
                .then((result) => {
                    res.redirect("/");
                })
                .catch((error) => console.error(error));
        });
        app
            .route("/edit/:id")
            .get((req, res) => {
                const id = req.params.id;
                TodoTask.find({}, (err, tasks) => {
                    res.render("todoEdit.ejs", { content: tasks, idTask: id });
                });
            })
            .post((req, res) => {
                const id_val = req.params.id;
                const queryvalue = { _id: ObjectID(id_val) };
                const new_val = { $set: { content: req.body.content } };
                simple_messages.updateOne(queryvalue, new_val, function (error, res) { })
                res.redirect("/")
            });
        app.route("/remove/:id").get((req, res) => {
            const id_val = req.params.id;
            const queryvalue = { _id: ObjectID(id_val) };
            simple_messages.remove(queryvalue, function (err, obj) {
                if (err) throw err;
                else
                    res.redirect("/");
            });

        });
    })
    .catch((error) => console.error(error));
