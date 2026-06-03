-- AlterForeignKey
ALTER TABLE `DetailPembelian` DROP FOREIGN KEY `DetailPembelian_pembelianTiketId_fkey`;

ALTER TABLE `DetailPembelian` ADD CONSTRAINT `DetailPembelian_pembelianTiketId_fkey` FOREIGN KEY (`pembelianTiketId`) REFERENCES `PembelianTiket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
