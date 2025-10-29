import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlansUsagePaymentsTables1761640187154
  implements MigrationInterface
{
  name = 'AddPlansUsagePaymentsTables1761640187154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create plans table
    await queryRunner.query(`
      CREATE TABLE "plan" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "otpLimit" integer NOT NULL,
        "smtpLimit" integer NOT NULL,
        "templateLimit" integer NOT NULL,
        "apiKeyLimit" integer NOT NULL,
        "price" integer NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_plan_name" UNIQUE ("name"),
        CONSTRAINT "PK_plan_id" PRIMARY KEY ("id")
      )
    `);

    // Create usage table
    await queryRunner.query(`
      CREATE TABLE "usage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "planId" uuid,
        "otpCount" integer NOT NULL DEFAULT 0,
        "smtpCount" integer NOT NULL DEFAULT 0,
        "templateCount" integer NOT NULL DEFAULT 0,
        "apiKeyCount" integer NOT NULL DEFAULT 0,
        "periodStart" TIMESTAMP NOT NULL DEFAULT now(),
        "periodEnd" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usage_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_usage_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_usage_plan" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE SET NULL
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "planId" uuid NOT NULL,
        "amount" integer NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "status" character varying NOT NULL DEFAULT 'pending',
        "paymentMethod" character varying,
        "transactionId" character varying,
        "stripePaymentIntentId" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payment_plan" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE CASCADE
      )
    `);

    // Add planId column to user table
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "planId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_plan" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE SET NULL
    `);

    // Insert default plans
    await queryRunner.query(`
      INSERT INTO "plan" ("id", "name", "otpLimit", "smtpLimit", "templateLimit", "apiKeyLimit", "price", "currency", "isDefault", "createdAt", "updatedAt") VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'Free', 500, 1, 2, 1, 0, 'USD', true, NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440002', 'Pro', 10000, 5, 10, 5, 999, 'USD', false, NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440003', 'Business', 50000, 10, 20, 10, 2999, 'USD', false, NOW(), NOW())
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_userId" ON "usage" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_planId" ON "usage" ("planId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_userId" ON "payment" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_planId" ON "payment" ("planId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_planId" ON "user" ("planId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_planId"`);
    await queryRunner.query(`DROP INDEX "IDX_payment_planId"`);
    await queryRunner.query(`DROP INDEX "IDX_payment_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_usage_planId"`);
    await queryRunner.query(`DROP INDEX "IDX_usage_userId"`);

    // Remove planId from user table
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_plan"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "planId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TABLE "usage"`);
    await queryRunner.query(`DROP TABLE "plan"`);
  }
}
