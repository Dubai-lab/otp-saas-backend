import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSmtpPasswordColumn1761276013692 implements MigrationInterface {
    name = 'FixSmtpPasswordColumn1761276013692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "send_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient" character varying NOT NULL, "provider" character varying NOT NULL, "type" character varying NOT NULL, "subject" character varying NOT NULL, "otp" character varying, "status" character varying NOT NULL DEFAULT 'pending', "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_e0400b2cea25a91f65be36ba274" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD "label" character varying`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "smtp_configs" DROP COLUMN "passwordEncrypted"`);
        await queryRunner.query(`ALTER TABLE "smtp_configs" ADD "passwordEncrypted" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "send_logs" ADD CONSTRAINT "FK_98bc2ec83c3728b3437a479e551" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "send_logs" DROP CONSTRAINT "FK_98bc2ec83c3728b3437a479e551"`);
        await queryRunner.query(`ALTER TABLE "smtp_configs" DROP COLUMN "passwordEncrypted"`);
        await queryRunner.query(`ALTER TABLE "smtp_configs" ADD "passwordEncrypted" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "label"`);
        await queryRunner.query(`DROP TABLE "send_logs"`);
    }

}
