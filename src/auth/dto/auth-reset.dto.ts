import { IsString , MinLength, isJWT } from "class-validator";


export class AuthResetDTO {
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    token: string;
}