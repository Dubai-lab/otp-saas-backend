import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLogEntity1761640187152 implements MigrationInterface {
    name = 'UpdateLogEntity1761640187152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "send_logs" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "send_logs" ADD "statuses" json NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "send_logs" ADD "currentStatus" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "send_logs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "send_logs" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "send_logs" DROP COLUMN "currentStatus"`);
        await queryRunner.query(`ALTER TABLE "send_logs" DROP COLUMN "statuses"`);
        await queryRunner.query(`ALTER TABLE "send_logs" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
    }

}
