import { JwtPayload } from "jsonwebtoken"

export interface IUser {
    id: number,
    username: string,
    password: string
}

export interface IJwtPayload extends JwtPayload {
    id:  number;
}