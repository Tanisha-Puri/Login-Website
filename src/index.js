const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        // res.send('User already exists. Please choose a different username.');
        return res.render("signup", { error: "Username already exists. Please try another name!", username: req.body.username });
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.render('home', { username: data.name }); // Passing username to home.ejs
    }
});

// app.post("/login", async (req, res) => {
//     try {
//         const check = await collection.findOne({ name: req.body.username });
        
//         if (!check) {
//             res.send("Username not found");
//         }

//         const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        
//         if (!isPasswordMatch) {
//             res.send("Wrong password");
//         } else {
//             res.render("home", { username: req.body.username }); // Passing username to home.ejs
//         }
//     } catch {
//         res.send("Wrong details");
//     }
// });

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        
        if (!check) {
            return res.render("login", { error: "Username not found", username: req.body.username });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        
        if (!isPasswordMatch) {
            return res.render("login", { error: "Wrong password", username: req.body.username });
        } else {
            return res.render("home", { username: req.body.username });
        }
    } catch {
        return res.render("login", { error: "Wrong details", username: req.body.username });
    }
});


const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
