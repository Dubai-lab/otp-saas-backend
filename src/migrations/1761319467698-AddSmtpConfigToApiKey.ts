import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSmtpConfigToApiKey1761319467698 implements MigrationInterface {
    name = 'AddSmtpConfigToApiKey1761319467698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" ADD "smtpConfigId" uuid`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD CONSTRAINT "FK_2426667b1a2a48c247ca6bf116d" FOREIGN KEY ("smtpConfigId") REFERENCES "smtp_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_2426667b1a2a48c247ca6bf116d"`);
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "smtpConfigId"`);
    }

}
