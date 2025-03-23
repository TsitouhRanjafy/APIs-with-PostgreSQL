import express, { Request, Response} from 'express'
import database from '../db.js'
import { StatusCodes } from 'http-status-codes';
import prisma from '../prismaClient.js';

const router = express.Router()

// Get all todos for logged-in user
router.get("/", async (req: Request, res: Response) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.body.user_id
        }
    });

    res.status(StatusCodes.OK).json(todos);
})

// Create a new todo
router.post("/",async (req: Request, res: Response) => {
    const  { task } = req.body
    
    const newTodo = await prisma.todo.create({
        data: {
            userId: req.body.user_id,
            task
        }
    })

    res.status(StatusCodes.CREATED).json(newTodo);
})

// update todo by id
router.put("/:id", async (req: Request, res: Response) => {
    const { completed } = req.body;
    const { id } = req.params;

    const updateTodo = await prisma.todo.update({
        where: { 
            id: parseInt(id),
            userId: req.body.user_id
         },
        data: { completed: !!completed } 
        // si completed = "true",1,[] ça devient true 
        // ça force la conversion en boolean true ou false
        // req.body.completed est souvent "true","false","1","0"
    })
    res.status(StatusCodes.OK).json(updateTodo)
})


router.delete("/:id",async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId: req.body.user_id
        }
    })

    res.status(StatusCodes.OK).send({message: "Todo deleted"});
})


export default router;


