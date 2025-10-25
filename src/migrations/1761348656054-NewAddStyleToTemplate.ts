import { MigrationInterface, QueryRunner } from "typeorm";

export class NewAddStyleToTemplate1761348656054 implements MigrationInterface {
    name = 'NewAddStyleToTemplate1761348656054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "body"`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "headerText" text`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "bodyText" text`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "footerText" text`);
        await queryRunner.query(`UPDATE "templates" SET "headerText" = '', "bodyText" = '', "footerText" = '' WHERE "headerText" IS NULL`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "headerText" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "bodyText" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "templates" ALTER COLUMN "footerText" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "footerText"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "bodyText"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "headerText"`);
        await queryRunner.query(`ALTER TABLE "templates" ADD "body" text NOT NULL`);
    }

}
