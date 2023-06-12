
import express from 'express'
import * as database from './database.js';

const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//GET request which allows the client to retrieve the scores of the top 10 players as well as their own score
app.get('/api/retrieve', async (req, res) => {
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
app.post('/api/store', (req, res) => {

    //Add the level and extra blocks to database if it is higher than the user's current high score
    console.log(req.body);

    //Return a resonse to the client with the level and extra blocks
    res.json({
        status: "success",
        level: req.body.level,
        extraBlocks: req.body.extraBlocks
    });
});

app.get('/', (req, res) => {
    console.log('Home page');
    res.render("/public/index.html");
    next();
});


app.listen(3000)