import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

import { FileModule } from 'src/file/file.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { AuthController } from './auth.controller';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
    }),
    forwardRef(() => UserModule),
    FileModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],

  controllers: [AuthController],
  providers: [AuthService, UserService, FileService],

  exports: [AuthService],
})
export class AuthModule {}
