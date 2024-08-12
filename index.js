import express from "express";
import data from "./data.js";
import bodyParser from "body-parser";
import session from "express-session";
import flash from 'connect-flash';
import mongoose from "mongoose";
import _ from "lodash";
import { mongoItems, mongoLists, mongoUsers } from "./mongoData.js";
import Item from "./models/items.js";
import List from "./models/lists.js";
import User from "./models/users.js";

// Setting up the express application
const app = express();
const port = 3000;

/*
Middlewares used in the application
1. express.static => used to utilize the static files like css files within public
2. bodyParser is used to parse the body so that we can reeive the data from request in a formatted way
3. session and flash are being used to send error message back while redirecting which is used to appropriately display error messages
4. A custom middleware so that no cached data is stored for an url so that when clicked on back the last logged in data is not stored after logging out.  
*/
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

// MongoDB setup
await mongoose.connect ("mongodb://localhost:27017/ultimateTodoListDB");


//Injecting Default Data in the mongo Database
// const response = await Item.insertMany (mongoItems);
// console.log ("MongoItems injected successfully", response);

// const response = await List.insertMany (mongoLists);
// console.log ("MongoLists injected successfully", response);

// const response = await User.insertMany (mongoUsers);
// console.log ("MongoUsers injected successfully", response);

let currentUser = "";

//User Defined Functions
const addItemToList = async (newItem) => {
    const response = await newItem.save();
    // console.log (response);

    const newItemId = response._id;
    // console.log (newItemId);

    await User.updateOne (
        {_id: currentUser},
        {$push: {
            items: newItemId
        }}
    );
}

const deleteItemFromList = async (itemId) => {
    const response = await User.updateOne (
        {_id: currentUser},
        {$pull: {
            items: itemId
        }}
    );

    // console.log (response);

    await Item.deleteOne (
        {_id: itemId}
    );
}

app.get ('/', (req, res) => {
    const signInError = req.flash('signInError')[0] || "";
    const signUpError = req.flash('signUpError')[0] || "";
    const signUpSuccess = req.flash('signUpSuccess')[0] || "";
    
    // console.log (signInError);

    res.render ("index.ejs", {
        signInError: signInError,
        signUpError: signUpError,
        signUpSuccess: signUpSuccess
    });
});


app.get ('/home', async (req, res) => {
    // console.log (data.users);
    // console.log (data.lists);
    // console.log (data.items);

    if (currentUser === "") {
        return res.render ("error.ejs");
    }

    const user = await User.find ({_id: currentUser});
    // console.log ("Inside Home, user = ", user);

    const userItemsIds = user[0].items;
    let userItems = [];

    for (let i = 0; i < userItemsIds.length; i++) {
        let tmp = await Item.find ({_id: userItemsIds [i]});
        // console.log (tmp [0]);
        userItems.push (tmp [0]);
    }

    // console.log (userItems);

    res.render ("todo.ejs", {
        userName: user[0].username,
        tasks: userItems
    })
});

app.post ('/signin', async (req, res) => {
    // console.log (req.body);

    const inputUsername = _.capitalize (req.body.username);
    const inputPassword = req.body.password;

    // console.log (inputUsername, inputPassword);

    // const user = data.users.find ((user) => user.username === inputUsername);
    const user = await User.find ({ username: inputUsername });
    // console.log (user);

    if (user.length !== 0) {
        // console.log ("User Found");

        if (inputPassword === user[0].password) {
            // console.log ("Correct Password");
            currentUser = user [0]._id;
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

app.post ('/signup', async (req, res) => {
    console.log (req.body);

    if (req.body.password !== req.body.repeat_password) {
        req.flash ('signUpError', "Password do not match! Try again.");
        return res.redirect ('/');
    }

    const inputUsername = _.capitalize (req.body.username);
    const inputPassword = req.body.password;
    const inputEmail = req.body.email;

    // console.log (inputUsername, inputPassword, inputEmail);

    let existingUser = await User.find ({username: inputUsername});
    if (existingUser.length !== 0) {
        req.flash ('signUpError', "Username already exists! Try again.");
        return res.redirect ('/');
    }

    existingUser = await User.find ({email: inputEmail });
    if (existingUser.length !== 0) {
        req.flash ('signUpError', "Email already exists! Try again.");
        return res.redirect ('/');
    }

    const newUser = new User ({
        username: inputUsername,
        password: inputPassword,
        email: inputEmail,
        lists: [],
        items: []
    });

    await newUser.save();

    req.flash ('signUpSuccess', "User Created Successfully! Sign In to continue");
    return res.redirect ('/');
})

app.post ('/logout', (req, res) => {
    currentUser = "";
    res.redirect ('/');
});


app.post ('/add-task', async (req, res) => {
    // console.log (req.body);

    const userTask = req.body.task;

    const newItem = new Item ({
        item_name: userTask,
        completed: false
    });

    await addItemToList (newItem);

    res.redirect ('/home');
});

app.post ('/delete-task', async (req, res) => {
    // console.log (req.body);

    const itemId = req.body.itemId;
    // console.log (itemId);

    await deleteItemFromList (itemId);

    res.redirect ('/home');
})

app.get ('*', (req, res) => {
    res.render ("error.ejs");
});

app.listen (port, () => {
    console.log (`Server running successfully on port ${port}`);
});