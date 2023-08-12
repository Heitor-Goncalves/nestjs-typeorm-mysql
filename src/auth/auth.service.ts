import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  private issuer: 'Login';
  private audience: 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  createToken(user: UserEntity) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: 'Login',
          audience: 'users',
        },
      ),
    };
  }
  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return data;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('email e ou senha está incorreto');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('email e ou senha está incorreto');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new UnauthorizedException('email está incorreto');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '7 days',
        subject: String(user.id),
        issuer: 'forget',
        audience: 'users',
      },
    );

    await this.mailer.sendMail({
      subject: 'Recuperação de Senha',
      to: 'joao@hotmail.com',
      template: 'forget',
      context: {
        name: user.name,
        token,
      },
    });
    return true;
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      });
      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token invalido');
      }

      password = await bcrypt.hash(password, await bcrypt.genSalt());

      await this.userRepository.update(Number(data.id), {
        password,
      });

      const user = await this.userService.show(Number(data.id));

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async regiser(data: AuthRegisterDTO) {
    //essa linha previne o usuario de cadastrar um Role, evitando a vulnerabilidade
    delete data.role;

    const user = await this.userService.create(data);
    return this.createToken(user);
  }
}
