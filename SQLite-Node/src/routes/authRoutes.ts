import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import database from '../db.js'
import express, { Application, Request, Response, Router } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { IUser } from '../model/user.type.js'

const router = express.Router()

// Register a new user endpoint /auth/register
router.post('/register',(req: Request, res: Response ) => {
    const { username,password } = req.body

    const hashpassword = bcrypt.hashSync(password,8);

    // save the new user and hashed password to the database
    try {
        // Create a prepared statement to insert data into the database.
        const inserUser = database.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        // Execute the prepared statement with bound values.
        const result = inserUser.run(username,hashpassword);

        // now that we have a user, I want to add their first todo for them
        const defaultToDo = `Hello :) Add your first todo!`
        const insertTodo = database.prepare(`INSERT INTO todos (user_id, task) VALUES (? , ?)`);
        insertTodo.run(result.lastInsertRowid, defaultToDo);

        // create a token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SCRET? process.env.JWT_SCRET:'TEST_KEY', { expiresIn: '24h' })
        
        res.json({token: token});
    } catch (error) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).sendStatus(503);
        throw error
    }
    
})

router.post('/login',(req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const getUser = database.prepare(`SELECT * FROM users WHERE username = ?`);
        const user = getUser.get(username) as IUser | undefined

        // if we cannot find a user associated with that username, return out from the function
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "User not found" }) 
            return;
        }

        const passwordIsValid = bcrypt.compareSync(password,user.password);
        // if the password does not match, return out of the function
        if (!passwordIsValid) {
            res.status(StatusCodes.UNAUTHORIZED).send({ message: "Invalid password" });
            return;
        }

        // then we have a successful authentication
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET? process.env.JWT_SECRET: 'TEST_KEY', { expiresIn: '24h' })
        res.json({ token })

    } catch (error) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
        throw error;
    }
    
})

router.get('/users',(req: Request, res: Response) => {
    try {
        const getUser = database.prepare(`SELECT * FROM users`);
        res.status(StatusCodes.OK).json(getUser.all());
    } catch (error) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
        throw error;    
    }
})

export default router;