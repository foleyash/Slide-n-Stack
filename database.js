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

//REQURIES: user_name is a valid user_name in the database, pool is a valid pool object for the database
//EFFECTS: returns the user_pass of the user with the given user_name
export async function getUserPass(user_name, pool) {
    const [user] = await pool.query("SELECT user_pass FROM login_user where user_name = ?", [user_name]);

    return user[0].user_pass;
}

//REQUIRES: user_name is a valid user_name in the database, pool is a valid pool object for the database
//EFFECTS: returns the user_id of the user with the given user_name
export async function getUserId(user_name, pool) {
    const [user_id] = await pool.query(`SELECT user_id FROM login_user WHERE user_name = ?`, [user_name]);
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

/* Additional functions to create:

    updateUserInfo - change placement, high_level, and extra_platforms for user w/ user_id.
    this should also update all placements of the users with lower scores by incrementing them by 1

    
*/

//const topScores = await getBestScores(loginInfo);
 
 /*const loginInfo = await getLoginInformation(pool);
const topScores = await getBestScores(loginInfo, pool);
console.log(topScores); test("123", pool).then((user) => console.log(user));
if(await doesUserExist("123", pool)) console.log("user exists");
else console.log("user does not exist"); */

