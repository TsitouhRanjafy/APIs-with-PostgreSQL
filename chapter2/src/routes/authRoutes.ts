import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import database from '../db.js'
import express, { Application, Request, Response, Router } from 'express'

const router = express.Router()

// Register a new user endpoint /auth/register
router.post('/register',(req: Request, res: Response ) => {
    const { username,password } = req.body

    const hashpassword = bcrypt.hashSync(password,8);

    // save the new user and hashed password to the database
    try {
        // Create a prepared statement to insert data into the database.
        const inserUser = database.prepare('INSERT INTO users (username, password) VALUES (? , ?)')
        // Execute the prepared statement with bound values.
        const result = inserUser.run(username,hashpassword);

        // now that we have a user, I want to add their first todo for them
        const defaultToDo = `Hello :) Add your first todo!`
        const insertTodo = database.prepare(`INSERT INTO todos (user_id, task) VALUES (? , ?)`);
        insertTodo.run(result.lastInsertRowid, defaultToDo);

        // create a token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SCRET? process.env.JWT_SCRET:'', { expiresIn: '24h' })
        
        res.json(token);
    } catch (error) {
        res.sendStatus(503);
        throw error
    }
    
})

router.post('/login',(req: Request, res: Response) => {
    console.log('login');
    
})

export default router;