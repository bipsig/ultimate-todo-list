import express from "express";
import data from "./data.js";
import bodyParser from "body-parser";
import session from "express-session";
import flash from 'connect-flash';

const app = express();
const port = 3000;

app.use (express.static ("public"));
app.use (bodyParser.urlencoded ({ extended: true }));
app.use (session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use (flash());
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});


let currentUser = -1;

const tasks = [
    { id: 1, title: 'Finish homework', completed: false },
    { id: 2, title: 'Read a book', completed: true },
    { id: 3, title: 'Go for a run', completed: false }
];

app.get ('/', (req, res) => {
    const signInError = req.flash('signInError')[0] || "";
    const signUpError = req.flash('signUpError')[0] || "";
    
    // console.log (signInError);

    res.render ("index.ejs", {
        signInError: signInError,
        signUpError: signUpError
    });
});


app.get ('/home', (req, res) => {
    // console.log (data.users);
    // console.log (data.lists);
    // console.log (data.items);

    if (currentUser === -1) {
        return res.render ("error.ejs");
    }

    const user = data.users.find ((user) => user.user_id === currentUser);
    console.log ("inside Home", user);

    const userItemsId = user.items;
    let userItems = [];

    for (let i = 0; i < userItemsId.length; i++) {
        let tmp = data.items.find ((item) => item.item_id === userItemsId [i]);
        // console.log (tmp);
        userItems.push (tmp);
    }

    console.log (userItems);

    res.render ("todo.ejs", {
        userName: user.username,
        tasks: userItems
    })
});

app.post ('/signin', (req, res) => {
    // console.log (req.body);

    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    const user = data.users.find ((user) => user.username === inputUsername);
    // console.log (user);

    if (user) {
        // console.log ("User Found");

        if (inputPassword === user.password) {
            // console.log ("Correct Password");
            currentUser = user.user_id;
            res.redirect ('/home');
        }
        else {
            // console.log ("Incorrect Password");

            req.flash ('signInError', "Incorrect Password! Try Again.")
            return res.redirect ('/')
        }
    }
    else {
        // console.log ("User Not Found");
        // res.render ("index.ejs", {
        //     signInError: "Username doesn't exist! Try again."
        // })

        req.flash ('signInError', "Username doesn't exist! Try again.");
        return res.redirect ('/');

        //Return statement ensures that no code beyond the res.redirect is executed which handles the problem of redundant redirects which you were facing in earlier projects
    }
});

app.post ('/logout', (req, res) => {
    currentUser = -1;
    res.redirect ('/');
});

app.get ('*', (req, res) => {
    res.render ("error.ejs");
});

app.listen (port, () => {
    console.log (`Server running successfully on port ${port}`);
});