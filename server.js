
import express from 'express'
import * as database from './database.js';
import bcrypt from 'bcrypt';

const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//GET request which allows the client to retrieve the scores of the top 10 players as well as their own score
app.get('/api/retrieveLeaderboards', async (req, res) => {

    try {
    const users = await database.getLoginInformation(database.pool);
    const topScores = await database.getBestScores(users, database.pool);

    res.json({
        status: 200,
        topScores: topScores
    });

    res.status(200).send();
    } catch {
        res.json({
            status: 500
        });
        res.status(500).send();
    }
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
    
    const id = await database.getUserId(req.body.username, database.pool);
    const user = await database.getUserInformation(id, database.pool);
    const hashedPassword = await database.getUserPass(req.body.username, database.pool);
    
    if(user == null) {
        return res.status(401).send("Cannot find user");
    }
    
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
        if(result) {
            
            console.log("User authenticated");
            res.json({
                status: "success",
                placement: user.placement,
                level: user.high_level,
                extraBlocks: user.extra_platforms
            });

            res.status(200).send("User authenticated");
        }
        else {

            res.status(403).send("Incorrect password");
        }
    });
       
});

app.post('/api/register', async (req, res) => {

    if(database.doesUserExist(req.body.username, database.pool)) {
        res.json({
            status: 409	
        });
        res.status(409).send();
    }
    else if(database.doesEmailExist(req.body.email, database.pool)) {
        res.json({
            status: 408
        });
        res.status(408).send();
    }

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //registers a new user in the database with the given username and hashed password
        const user_id = await database.createNewUser(req.body.email, req.body.username, hashedPassword, database.pool);
        const user = await database.getUserInformation(user_id, database.pool);
        res.json({
            status: 201,
            placement: user.placement,
            high_level: user.high_level,
            extra_platforms: user.extra_platforms
        });

        //send 201 status to client to indicate that the user was created
        res.status(201).send()
    } catch {
        res.json({
            status: 500
        });
        res.status(500).send();
    }
});

app.get('/', (req, res) => {
    console.log('Home page');
    res.render("/public/index.html");
    next();
});


app.listen(3000)