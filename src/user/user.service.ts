import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDTO) {
    if (
      await this.userRepository.exist({
        where: {
          email: data.email,
        },
      })
    )
      data.password = data.password;

    data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());

    const user = await this.userRepository.create(data);

    return this.userRepository.save(user);
  }

  async list() {
    return this.userRepository.find();
  }

  async show(id: number) {
    await this.exists(id);

    return this.userRepository.findOneBy({
      id,
    });
  }

  async update(
    id: number,
    { email, name, password, birthAt, role }: UpdatePutUserDTO,
  ) {
    await this.exists(id);

    password = await bcrypt.hash(password, await bcrypt.genSalt());

    await this.userRepository.update(id, {
      email,
      name,
      password,
      birthAt: birthAt ? new Date(birthAt) : null,
      role,
    });

    return this.show(id);
  }

  async updatePartial(
    id: number,
    { email, name, password, birthAt, role }: UpdatePatchUserDTO,
  ) {
    await this.exists(id);

    const data: any = {};

    if (birthAt) {
      data.birthAt = new Date(birthAt);
    }
    if (name) {
      data.name = name;
    }

    if (password) {
      data.password = await bcrypt.hash(password, await bcrypt.genSalt());
    }

    if (email) {
      data.email = email;
    }

    if (role) {
      data.role = role;
    }

    await this.userRepository.update(id, data);

    return this.show(id);
  }

  async delete(id: number) {
    await this.exists(id);

    return this.userRepository.delete(id);
  }

  async exists(id: number) {
    if (
      !(await this.userRepository.exist({
        where: {
          id,
        },
      }))
    ) {
      throw new NotFoundException(`o usuário ${id} não existe.`);
    }
  }
}
