import express, { Request, Response} from 'express'
import database from '../db.js'
import { StatusCodes } from 'http-status-codes';

const router = express.Router()

// Get all todos for logged-in user
router.get("/",(req: Request, res: Response) => {
    const getTodos = database.prepare(`SELECT * FROM todos WHERE user_id = ?`);
    const todos = getTodos.all(req.body.user_id);
    res.status(StatusCodes.OK).json(todos);
})

// Create a new todo
router.post("/",(req: Request, res: Response) => {
    const  { task } = req.body
    const insertTodo = database.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
    const result = insertTodo.run(req.body.user_id, task)

    res.json({ id: result.lastInsertRowid, task, completed: 0 });
})

// update todo by id
router.put("/:id",(req: Request, res: Response) => {
    
})


router.delete("/:id",(req: Request, res: Response) => {
    
})


export default router;


