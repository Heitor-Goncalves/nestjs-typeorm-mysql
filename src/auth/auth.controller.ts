import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, UploadedFiles ,ParseFilePipe , FileTypeValidator , MaxFileSizeValidator} from "@nestjs/common";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { UserService } from "src/user/user.service";
import { AuthResetDTO } from "./dto/auth-reset.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "src/decorators/user.decorator";
import { FileInterceptor , FilesInterceptor , FileFieldsInterceptor } from "@nestjs/platform-express";
import { join } from "path";
import { FileService } from "src/file/file.service";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService
    ) { }

    @Post('login')
    async login(@Body() { email, password }: AuthLoginDTO) {
        return this.authService.login(email, password)
    }

    @Post('register')
    async register(@Body() body: AuthRegisterDTO) {
        return this.authService.regiser(body);
    }

    @Post('Forget')
    async forget(@Body() { email }: AuthForgetDTO) {
        return this.authService.forget(email);
    }

    @Post('reset')
    async reset(@Body() { password, token }: AuthResetDTO) {
        return this.authService.reset(password, token);
    }

    @UseGuards(AuthGuard)
    @Post('me')

    // foi criado o decorador User para sempre ter acesso aos dados do usuario no banco e ele funciona em conjunto om authguad
    async me(@User() user) {
        return { user };
    }

    @UseInterceptors(FileInterceptor('file')) // dentro da função FileInterceptors eu passo o nome do que foi atribuido
    @UseGuards(AuthGuard)
    @Post('photo')
    async uploadPhoto(@User() user, @UploadedFile( 
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({fileType:'image/png'}),
                new MaxFileSizeValidator({maxSize: 1024 * 50})
            ]
    })) photo: Express.Multer.File) {

        const path = join(__dirname, '..', '..', 'storage', 'photos', `photo-${user.id}.png`);

        try {
            this.fileService.upload(photo, path);
        }catch(e){
            throw new BadRequestException(e)
        }
        return { sucess: true };
    }


    //enviando multiplos aquivos de um tipo só
    @UseInterceptors(FilesInterceptor('files')) 
    @UseGuards(AuthGuard)
    @Post('files')
    async uploadFiles(@User() user, @UploadedFiles() files: Express.Multer.File[]){
        return files
    }




      //usando o filefields eu consigo enviar varios arquivos de tipos
    @UseInterceptors(FileFieldsInterceptor([{
        name: 'photo',
        maxCount: 1
    }, {
        name:'document',
        maxCount: 10
    }])) 
    @UseGuards(AuthGuard)
    @Post('files-fields')
    async uploadFilesFields(@User() user, @UploadedFiles() files: {photo: Express.Multer.File, documents: Express.Multer.File[]}){
        return files;
    }
}