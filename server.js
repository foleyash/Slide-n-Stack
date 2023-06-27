
import express from 'express'
import * as database from './database.js';
import bcrypt from 'bcrypt';

const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '10mb'}));

//GET request which allows the client to retrieve the scores of the top 25 players
app.get('/api/retrieveLeaderboards', async (req, res) => {

    try {
    const users = await database.getLoginInformation(database.pool);
    const topScores = await database.getBestScores(users, database.pool);

    return res.json({
        status: 200,
        topScores: topScores
    }).status(200);

   } catch (err) {
        console.error(err);
        return res.json({
            status: 500
        }).status(500).send();

    }
});

//REQUIRES: req.body contains a valid username and contains a higher score than that user's previous high score
app.post('/api/updateScore', async (req, res) => {

    //Add the level and extra blocks to database if it is higher than the user's current high score
    const id = await database.getUserId(req.body.username, database.pool);

    try {
        const users = await database.getLoginInformation(database.pool);
        const placement = await database.updateUserScore(id, users, req.body.level, req.body.extraBlocks, database.pool);

        //Return a resonse to the client with the level and extra blocks
        return res.json({
            status: 201,
            username: req.body.username,
            placement: placement,
            level: req.body.level,
            extraBlocks: req.body.extraBlocks
        }).status(201).send();
    }
    catch (err) {
        //Return a 500 status to the client if there is an error with the server
        return res.json({
            status: 500,
            error: err
        }).status(500).send();
    }
});

//REQURIES: req.body contains a username and password
//EFFECTS: returns a 200 status if the user is authenticated, 401 status if the user is not authenticated
app.post('/api/authenticate', async (req, res) => {
    
    const id = await database.getUserId(req.body.username, database.pool);
    if(id === null) {
        //send 401 status to client to indicate that the user was not found
        return res.json({
            status: 401
        }).status(401);
    }

    const user_name = await database.getUserName(id, database.pool);
    const user = await database.getUserInformation(id, database.pool);
    const hashedPassword = await database.getUserPass(req.body.username, database.pool);
    
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
        if(result) {
            
            //send 200 status to client to indicate that the user was authenticated
            return res.json({
                status: 200,
                username: user_name,
                placement: user.placement,
                level: user.high_level,
                extraBlocks: user.extra_platforms
            }).status(200);
            
        }
        else {

            //send 403 status to client to indicate that the password was incorrect
            return res.json({
                status: 403
            }).status(403);
    
        }
        
    });
       
});

app.post('/api/register', async (req, res) => {

    if(await database.doesUserExist(req.body.username, database.pool)) {
        return res.json({
            status: 409	
        }).status(409).send();

    }
    else if(await database.doesEmailExist(req.body.email, database.pool)) {
        return res.json({
            status: 408
        }).status(408).send();

    }

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //registers a new user in the database with the given username and hashed password
        const user_id = await database.createNewUser(req.body.email, req.body.username, hashedPassword, database.pool);
        const user = await database.getUserInformation(user_id, database.pool);

        //send 201 status to client to indicate that the user was created
        //send json information about the user to the client
        return res.json({
            status: 201,
            username: req.body.username,
            placement: user.placement,
            level: user.high_level,
            extraBlocks: user.extra_platforms
        }).status(201).send();
        
    } catch {
        //send error status to the client
        return res.json({
            status: 500
        }).status(500).send();
    }
});

app.get('/', (req, res) => {
    console.log('Home page');
    res.render("/public/index.html");
    next();
});


app.listen(3000)