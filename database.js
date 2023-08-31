import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

//EFFECTS: Returns an array of login information for all users in the database (user_id, user_email, user_name, user_pass)
export async function getLoginInformation(pool) {
    const [login_info] = await pool.query("SELECT * FROM login_user")

    return login_info;
}

//EFFECTS: Returns a boolean value if the username is already registered with the database
export async function doesUserExist(user_name, pool) {
    const [user] = await pool.query("SELECT * FROM login_user WHERE user_name = ?", [user_name]);

    return user.length > 0;
}

//EFFECTS: Returns a boolean value if the email is already registered with the database
export async function doesEmailExist(user_email, pool) {
    const [email] = await pool.query("SELECT * FROM login_user WHERE user_email = ?", [user_email]);
    
    return email.length > 0;
}

//REQURIES: user_id is a valid user_id in the database, pool is a valid pool object for the database
//EFFECTS: returns the user_pass of the user with the given user_name
export async function getUserPass(user_id, pool) {
    const [user] = await pool.query("SELECT user_pass FROM login_user where user_id = ?", [user_id]);

    return user[0].user_pass;
}

//REQUIRES: user_name is a valid user_name in the database, pool is a valid pool object for the database
//EFFECTS: returns the user_id of the user with the given user_name
export async function getUserId(user_name, pool) {
    let [user_id] = await pool.query(`SELECT user_id FROM login_user WHERE user_name = ?`, [user_name]);

    //if user does not exist, check if the user_name is actually an email
    if(user_id.length === 0) {
        [user_id] = await pool.query(`SELECT user_id FROM login_user WHERE user_email = ?`, [user_name]);
    }

    if(user_id.length === 0) return null;
    else return user_id[0].user_id;
}

//REQUIRES: user_id is a valid user_id in the database, pool is a valid pool object for the database
//EFFECTS: returns the user_name of the user with the given user_id
export async function getUserName(user_id, pool) {
    const [user_name] = await pool.query(`SELECT user_name FROM login_user WHERE user_id = ?`, [user_id]);

    return user_name[0].user_name;
}

//REQURIES: user_id is a valid user_id in the database, pool is a valid pool object for the database
//EFFECTS: returns an object of the user's information that contains placement, high_level, and extra_platforms
export async function getUserInformation(user_id, pool) {
    const [user_info] = await pool.query(`
    SELECT * 
    FROM users
    WHERE user_id = ?
    `, [user_id]);

    return user_info[0];
}

//REQUIRES: user_name and user_pass <= 50 chars
//MODIFIES: login_user and users tables
//EFFECTS: adds a new user to the database with default values, returns the user_id of the new user
export async function createNewUser(user_email, user_name, user_pass, pool) {
    const [result] = await pool.query(`
    INSERT INTO login_user (user_email, user_name, user_pass)
    VALUES (?, ?, ?)
    `, [user_email, user_name, user_pass])

    const id = result.insertId

    //get the number of users in the database
    const rows = await pool.query(`SELECT COUNT(*) as numUsers FROM login_user`)

    //insert user_id and place the user in the last place
    await pool.query(`
    INSERT INTO users (user_id, placement)
    VALUES (?, ?)
    `, [id, rows[0][0].numUsers])

    return id;
}

//REQUIRES: users is a valid array of the loginInformation objects including user_id, user_name, and user_pass
//EFFFECTS: returns an array of objects of the top 10 or less users and their respective placements and scores
export async function getBestScores(users, pool) {
    let topScores = [];
    for(let i = 0; i < users.length; i++) {

        const id = users[i].user_id;
     
        const userInfo = await getUserInformation(id, pool);
        const placement = userInfo.placement;
        
        if(placement <= 25) {
            let user = {
                user_name: users[i].user_name,
                placement: placement,
                high_level: userInfo.high_level,
                extra_platforms: userInfo.extra_platforms
            };
            
            if(topScores.length === 0) topScores.push(user);
            else {
                topScores.push(user);
                for(let j = topScores.length - 2; j >= 0; j--) {
                    if(topScores[j].placement > topScores[j + 1].placement) {
                        let temp = topScores[j];
                        topScores[j] = topScores[j + 1];
                        topScores[j + 1] = temp;
                    }
                    else {
                        break;
                    }
                }
            
            }
        }
    }

    return topScores;
}

//REQURIES: user_id is a valid user_id in the database, pool is a valid pool object for the database,
//          level and platforms form a higher score than the user's current score
//MODIFIES: MySQL database by updating the user's level and extra platforms and updating the placements of the other users
//EFFECTS: returns the user's new placement
export async function updateUserScore(user_id, users, level, platforms, pool) {
    
    const currPlacement = await pool.query(`SELECT placement FROM users WHERE user_id = ?`, [user_id]);

    //update the user's level and extra platforms
    const [user] = await pool.query(`UPDATE users
    SET high_level = ?, extra_platforms = ?
    WHERE user_id = ?`, [level, platforms, user_id]);

    //update the other users's placements if the user's score is less than the updated user's score
    const placement = updatePlacements(user_id, users, currPlacement[0][0].placement, level, platforms, pool);

    return placement;
}

export async function updatePlacements(user_id, users, placement, level, platforms, pool) {

    const numUsers = await pool.query(`SELECT COUNT(*) as numUsers FROM users
                                      WHERE placement < ? AND (high_level < ? OR (high_level = ? 
                                      AND extra_platforms < ?))`,
                                      [placement, level, level, platforms]);
    //if the number of users that are surpassed is > 0, update the placements of the users that are surpassed
    // and of the acting user

    if(numUsers[0][0].numUsers > 0) {
        const newPlacement = placement - numUsers[0][0].numUsers;
        
        //update the user's placement
        await pool.query(`UPDATE users
        SET placement = ?
        WHERE user_id = ?`, [newPlacement, user_id]);

        //update the placements of the users that are surpassed
        await pool.query(`UPDATE users	
        SET placement = placement + 1 
        WHERE placement < ? 
        AND (high_level < ? OR (high_level = ? AND extra_platforms < ?))`, 
        [placement, level, level, platforms]);
        
        return newPlacement;
    }
    else return placement;
}
    





