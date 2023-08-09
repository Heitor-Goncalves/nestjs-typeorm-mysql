import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./dto/update-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateUserDTO) {

        data.password = data.password;

        data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());

        return this.prisma.user.create({
            data,
        });

    }

    async list() {
        return this.prisma.user.findMany();
    }

    async show(id: number) {

        await this.exists(id);

        return this.prisma.user.findUnique({
            where: {
                id,
            }
        });
    }

    async update(id: number, { email, name, password, birthAt, role }: UpdatePutUserDTO) {

        await this.exists(id);

        password = await bcrypt.hash(password, await bcrypt.genSalt());

        return this.prisma.user.update({
            data: { email, name, password, birthAt: birthAt ? new Date(birthAt) : null, role },
            where: {
                id
            }
        })
    }

    async updatePartial(id: number, { email, name, password, birthAt, role }: UpdatePatchUserDTO) {

        await this.exists(id);

        const data: any = {};

        if (birthAt) {
            data.birthAt = new Date(birthAt)
        }
        if (name) {
            data.name = name
        }

        if (password) {
            data.password = await bcrypt.hash(password, await bcrypt.genSalt());
        }

        if (email) {
            data.email = email
        }

        if (role) {
            data.role = role
        }

        return this.prisma.user.update({
            data,
            where: {
                id
            }
        })
    }

    async delete(id: number) {

        await this.exists(id);

        return this.prisma.user.delete({
            where: {
                id
            }
        });
    }


    async exists(id: number) {

        if (!(await this.prisma.user.count({
            where: {
                id
            }
        }))) {
            throw new NotFoundException(`o usuário ${id} não existe.`);
        }
    }

}
