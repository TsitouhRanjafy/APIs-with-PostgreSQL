import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from '../prismaClient.js'

const router = express.Router()

// Register a new user endpoint /auth/register
router.post('/register', async (req: Request, res: Response ) => {
    const { username,password } = req.body

    const hashpassword = bcrypt.hashSync(password,8);

    // save the new user and hashed password to the database
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashpassword
            }
        })

        // now that we have a user, I want to add their first todo for them
        const defaultToDo = `Hello :) Add your first todo!`;
        await prisma.todo.create({
            data: {
                task: defaultToDo,
                userId: user.id,

            }
        })

        // create a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SCRET? process.env.JWT_SCRET:'TEST_KEY', { expiresIn: '24h' })
        
        res.json({token: token});
    } catch (error) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).sendStatus(503);
        throw error
    }
    
})

router.post('/login',async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        })

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

router.get('/users',async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.status(StatusCodes.OK).json(users);
    } catch (error) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).sendStatus(StatusCodes.SERVICE_UNAVAILABLE);
        throw error;    
    }
})

export default router;