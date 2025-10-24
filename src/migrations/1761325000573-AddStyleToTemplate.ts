import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStyleToTemplate1761325000573 implements MigrationInterface {
    name = 'AddStyleToTemplate1761325000573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" ADD "styles" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "templates" DROP COLUMN "styles"`);
    }

}
