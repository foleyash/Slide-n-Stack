import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getLoginInformation() {
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
export async function createNewUser(user_name, user_pass) {
    const [result] = await pool.query(`
    INSERT INTO login_user (user_name, user_pass)
    VALUES (?, ?)
    `, [user_name, user_pass])

    const id = result.insertId

    //insert user_id and place the user in the last place
    await pool.query(`
    INSERT INTO users (user_id, placement)
    VALUES (?, ?)
    `, [id, id])
}

/* Additional functions to create:

    updateUserInfo - change placement, high_level, and extra_platforms for user w/ user_id.
    this should also update all placements of the users with lower scores by incrementing them by 1

    
*/

const loginInfo = await getLoginInformation()
const userInfo = await getUserInformation(1)
const insert = await createNewUser('foleya', 'password')

console.log(insert)

