import express from "express";

const app = express();
const port = 3000;

app.use (express.static ("public"));

const tasks = [
    { id: 1, title: 'Finish homework', completed: false },
    { id: 2, title: 'Read a book', completed: true },
    { id: 3, title: 'Go for a run', completed: false }
];

app.get ('/', (req, res) => {
    res.render ("index.ejs");
})

app.get ('/home', (req, res) => {
    res.render ("todo.ejs", {
        tasks: tasks
    })
})

app.listen (port, () => {
    console.log (`Server running successfully on port ${port}`);
})