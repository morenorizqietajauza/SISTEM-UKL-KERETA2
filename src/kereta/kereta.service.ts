import { HttpException, Injectable } from '@nestjs/common';
import { CreateKeretaDto } from './dto/create-kereta.dto';
import { UpdateKeretaDto } from './dto/update-kereta.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { prismaErrors } from 'src/utils/prisma-error.utils';
import { AppError } from 'src/utils/app-error.utils';

@Injectable()
export class KeretaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKeretaDto: CreateKeretaDto) {
    try {
      const kereta = await this.prisma.kereta.create({
        data: { ...createKeretaDto },
      });

      if (!kereta) {
        throw AppError.badRequest({ message: 'Gagal menambahkan data kereta' });
      }

      return kereta;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw await prismaErrors(error);
      }
      console.log(error);
    }
  }

  async findAll() {
    try {
      const kereta = await this.prisma.kereta.findMany();

      if (!kereta) {
        throw AppError.notFound('Train', {
          message: 'Gagal mengambil semua data kereta',
        });
      }

      return kereta;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw await prismaErrors(error);
      }
      console.log(error);
    }
  }

  async findOne(id: number) {
    try {
      const kereta = await this.prisma.kereta.findFirst({ where: { id } });

      if (!kereta) {
        throw AppError.notFound('Train', {
          message: 'Gagal mengambil data kereta',
        });
      }

      return kereta;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw await prismaErrors(error);
      }
      console.log(error);
    }
  }

  async update(id: number, updateKeretaDto: UpdateKeretaDto) {
    try {
      const kereta = await this.prisma.kereta.update({
        where: { id },
        data: { ...updateKeretaDto },
      });

      if (!kereta) {
        throw AppError.badRequest({ message: 'Gagal mengupate data kereta' });
      }

      return kereta;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw await prismaErrors(error);
      }
      console.log(error);
    }
  }

  async remove(id: number) {
    try {
      const kereta = await this.prisma.kereta.findUnique({ where: { id } });

      if (!kereta) {
        throw AppError.notFound('Train', {
          message: 'Gagal menemukan data kereta',
        });
      }

      await this.prisma.$transaction(async (tx) => {
        const gerbongs = await tx.gerbong.findMany({
          where: { keretaId: id },
          select: { id: true },
        });
        const gerbongIds = gerbongs.map((g) => g.id);

        const kursiList =
          gerbongIds.length > 0
            ? await tx.kursi.findMany({
                where: { gerbongId: { in: gerbongIds } },
                select: { id: true },
              })
            : [];
        const kursiIds = kursiList.map((k) => k.id);

        const jadwals = await tx.jadwal.findMany({
          where: { keretaId: id },
          select: { id: true },
        });
        const jadwalIds = jadwals.map((j) => j.id);

        if (kursiIds.length > 0) {
          await tx.detailPembelian.deleteMany({
            where: { kursiId: { in: kursiIds } },
          });
        }

        if (jadwalIds.length > 0) {
          await tx.pembelianTiket.deleteMany({
            where: { jadwalId: { in: jadwalIds } },
          });
        }

        if (gerbongIds.length > 0) {
          await tx.kursi.deleteMany({
            where: { gerbongId: { in: gerbongIds } },
          });
          await tx.gerbong.deleteMany({ where: { keretaId: id } });
        }

        if (jadwalIds.length > 0) {
          await tx.jadwal.deleteMany({ where: { keretaId: id } });
        }

        await tx.kereta.delete({ where: { id } });
      });

      return kereta;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw await prismaErrors(error);
      }
      console.log(error);
    }
  }
}
