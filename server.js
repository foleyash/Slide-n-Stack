
import express from 'express'
import * as database from './database.js';
import bcrypt from 'bcrypt';

const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//GET request which allows the client to retrieve the scores of the top 10 players as well as their own score
app.get('/api/retrieveLeaderboards', async (req, res) => {
    const users = await database.getLoginInformation(database.pool);
    console.log(users);
    console.log("Got users");
    const topScores = await database.getBestScores(users);

    res.json({
        status: "success",
        topScores: topScores
    })
});

//POST request which allows the client to store their score in the database
app.post('/api/updateScore', (req, res) => {

    //Add the level and extra blocks to database if it is higher than the user's current high score
    //TODO: use updateHighScore() function from database.js
    console.log(req.body);

    //Return a resonse to the client with the level and extra blocks
    res.json({
        status: "success",
        level: req.body.level,
        extraBlocks: req.body.extraBlocks
    });
});

//REQURIES: req.body contains a username and password
//EFFECTS: returns a 200 status if the user is authenticated, 401 status if the user is not authenticated
app.post('/api/authenticate', async (req, res) => {
    const user = await database.getUser(req.body.username, database.pool);
    if(user == null) {
        return res.status(401).send("Cannot find user");
    }
    try {
        if(await bcrypt.compare(req.body.password, user.user_pass)) {
            res.status(200).send();
        }
        else {
            res.status(401).send();
        }
    } catch {
        res.status(500).send();
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //registers a new user in the database with the given username and hashed password
        database.createNewUser(req.body.username, hashedPassword, database.pool);

        //send 201 status to client to indicate that the user was created
        res.status(201).send()
    } catch {
        res.status(500).send();
    }
});

app.get('/', (req, res) => {
    console.log('Home page');
    res.render("/public/index.html");
    next();
});


app.listen(3000)