-- CreateTable
CREATE TABLE `links` (
    `id` VARCHAR(191) NOT NULL,
    `creatorWallet` VARCHAR(58) NOT NULL,
    `content_type` VARCHAR(191) NOT NULL,
    `content_path` TEXT NULL,
    `price` DECIMAL(18, 6) NOT NULL,
    `network` VARCHAR(20) NOT NULL,
    `asset_id` BIGINT NOT NULL,
    `decimals` INTEGER NOT NULL DEFAULT 6,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `links_creatorWallet_idx`(`creatorWallet`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `link_id` VARCHAR(191) NOT NULL,
    `payer_address` VARCHAR(58) NOT NULL,
    `amount` DECIMAL(18, 6) NOT NULL,
    `txn_id` VARCHAR(52) NULL,
    `txn_group_id` VARCHAR(52) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payments_link_id_idx`(`link_id`),
    INDEX `payments_payer_address_idx`(`payer_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_link_id_fkey` FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
