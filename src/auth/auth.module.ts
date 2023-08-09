import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { FileService } from "src/file/file.service";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET
    }),
    forwardRef(() => UserModule),
        PrismaModule
    ],

    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        FileService
    ],

    exports: [AuthService]
})
export class AuthModule {

}