import express, { Request, Response} from 'express'
import database from '../db.js'

const router = express.Router()

// Get all todos for logged-in user
router.get("/",(req: Request, res: Response) => {

})

// Create a new todo
router.post("/",(req: Request, res: Response) => {
    
})

// update todo by id
router.put("/:id",(req: Request, res: Response) => {
    
})


router.delete("/:id",(req: Request, res: Response) => {
    
})


export default router;


