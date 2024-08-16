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


//Global variables to maintain the current user and the list being utilized. Basically helps in reducing the number of Mongo Queries
let currentUser = "";
let currentUsername = "";
let currentListId = "";
let currentListName = "";

//User Defined Functions
/*
    1. To add item to a list. Based on currentListId it is decided whether to add to a particular list or default list of user
    2. To delete item from a list with similar functionalities of the above
    3. To find list of a user. If such a list already exists return that list or return null value so that we can create a new list as required.
*/
const addItemToList = async (newItem) => {
    const response = await newItem.save();
    // console.log (response);

    const newItemId = response._id;
    // console.log (newItemId);

    if (currentListId === "") {
        await User.updateOne (
            {_id: currentUser},
            {$push: {
                items: newItemId
            }}
        );
    }
    else {
        await List.updateOne (
            {_id: currentListId},
            {$push: {
                items: newItemId
            }}
        );
    }
}

const deleteItemFromList = async (itemId) => {
    if (currentListId === "") {
        await User.updateOne (
            {_id: currentUser},
            {$pull: {
                items: itemId
            }}
        );
    }
    else {
        await List.updateOne (
            {_id: currentListId},
            {$pull: {
                items: itemId
            }}
        );
    }

    // console.log (response);
    await Item.deleteOne (
        {_id: itemId}
    );
};

const findList = async (listName) => {
    const response = await User.find({_id: currentUser});
    // console.log (response);
    const availableLists = response[0].lists;
    // console.log (availableLists);

    for (let i = 0; i < availableLists.length; i++) {
        const returnedList = await List.findById (availableLists [i]);
        // console.log (returnedList);

        if (returnedList.list_name === listName) {
            return returnedList;
        }
    }

    return null;
};

// Default page
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

//We check whether a user is logged in or not. If not we display a page that no user logged in,
app.get ('/home', async (req, res) => {
    // console.log (data.users);
    // console.log (data.lists);
    // console.log (data.items);

    if (currentUser === "") {
        return res.render ("error.ejs");
    }

    const user = await User.find ({_id: currentUser});
    currentListId = "";
    currentListName = "";
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
        listName: "General List",
        userName: user[0].username,
        tasks: userItems
    })
});

app.get ("/home/:path", async (req, res) => {
    // console.log ("Current User: ", currentUser);
    // console.log ("Path: ", req.params.path);

    if (currentUser === "") {
        return res.redirect ('/home');
    }

    const listName = _.capitalize (req.params.path);

    const listExists = await findList (listName);

    if (listExists) {
        // console.log ("List Exists: ", listExists);

        const listItemIds = listExists.items;
        let itemList = [];

        for (let i = 0; i < listItemIds.length; i++) {
            const res = await Item.findById (listItemIds [i]);

            itemList.push (res);
        }

        // console.log (itemList);
        currentListId = listExists._id;
        currentListName = listName;
        return res.render ("todo.ejs", {
            listName: listName,
            userName: currentUsername,
            tasks: itemList
        });
    }
    else {
        // console.log ("No such list exists", listName);
        
        const newList = new List ({
            list_name: listName,
            items: []
        });

        const response = await newList.save();
        // console.log (response._id); 

        await User.updateOne (
            {_id: currentUser},
            {$push: {
                lists: response._id
            }}
        );

        // console.log ("done");

        return res.redirect (`/home/${listName}`);
    }
});


//Tasks updation Routes
app.post ('/add-task', async (req, res) => {
    // console.log (req.body);

    const userTask = req.body.task;

    const newItem = new Item ({
        item_name: userTask,
        completed: false
    });

    await addItemToList (newItem);

    if (currentListId === "") {
        res.redirect ('/home');
    }
    else {
        res.redirect (`/home/${currentListName}`)
    }
});

app.post ('/delete-task', async (req, res) => {
    // console.log (req.body);

    const itemId = req.body.itemId;
    // console.log (itemId);

    await deleteItemFromList (itemId);

    if (currentListId === "") {
        res.redirect ('/home');
    }
    else {
        res.redirect (`/home/${currentListName}`)
    }
})

app.post ('/toggle-task', async (req, res) => {
    // console.log (req.body);

    const isCompleted  = req.body.isCompleted === "true" ? false : true;
    const itemId = req.body.itemId;

    // console.log (isCompleted);

    const response = await Item.updateOne (
        {_id: itemId},
        {$set: {
            completed: isCompleted
        }}
    );

    // console.log (response);

    if (currentListId === "") {
        res.redirect ('/home');
    }
    else {
        res.redirect (`/home/${currentListName}`)
    }
});

//User login/Registration Routes
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
            currentUsername = inputUsername;
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
    currentUsername = "";
    currentListId = "";
    currentListName = "";
    res.redirect ('/');
});


app.get ('*', (req, res) => {
    res.render ("404.ejs");
});

app.listen (port, () => {
    console.log (`Server running successfully on port ${port}`);
});