import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getLoginInformation(pool) {
    const [login_info] = await pool.query("SELECT * FROM login_user")

    return login_info
}

export async function getUserInformation(user_id) {
    const [user_info] = await pool.query(`
    SELECT * 
    FROM users
    WHERE user_id = ?
    `, [user_id])

    return user_info[0]
}

//REQUIRES: user_name and user_pass <= 50 chars
//MODIFIES: login_user and users tables
//EFFECTS: adds a new user to the database with default values
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

}

//REQUIRES: users is a valid array of the loginInformation objects including user_id, user_name, and user_pass
//EFFFECTS: returns an array of objects of the top 10 or less users and their respective placements and scores
export async function getBestScores(users) {
    let topScores = [];
    for(let i = 0; i < users.length; i++) {

        const id = users[i].user_id;
     
        const userInfo = await getUserInformation(id);
        const placement = await userInfo.placement;
        
        if(placement <= 25) {
            let user = {
                user_name: users[i].user_name,
                placement: placement,
                high_level: await userInfo.high_level,
                extra_platforms: await userInfo.extra_platforms
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
/* await createNewUser("foleyash24@gmail.com", "foleyash", "password", pool);
const loginInfo = await getLoginInformation(pool);
console.log(loginInfo);
const user = await getUserInformation(46);
console.log(user); */



