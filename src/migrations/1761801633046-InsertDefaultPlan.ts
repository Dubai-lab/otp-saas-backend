import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultPlan1761801633046 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "plan" ("id", "name", "otpLimit", "smtpLimit", "templateLimit", "apiKeyLimit", "price", "currency", "isDefault", "createdAt", "updatedAt") VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Free', 100, 10, 5, 3, 0, 'USD', true, now(), now())`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
