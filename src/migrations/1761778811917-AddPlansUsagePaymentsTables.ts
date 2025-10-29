import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlansUsagePaymentsTables1761778811917 implements MigrationInterface {
    name = 'AddPlansUsagePaymentsTables1761778811917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planId" uuid, "otpCount" integer NOT NULL DEFAULT '0', "smtpCount" integer NOT NULL DEFAULT '0', "templateCount" integer NOT NULL DEFAULT '0', "apiKeyCount" integer NOT NULL DEFAULT '0', "periodStart" TIMESTAMP NOT NULL, "periodEnd" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7bc33e71ab6c3b71eac72950b44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "amount" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" character varying, "transactionId" character varying, "stripePaymentIntentId" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "otpLimit" integer NOT NULL, "smtpLimit" integer NOT NULL, "templateLimit" integer NOT NULL, "apiKeyLimit" integer NOT NULL, "price" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8aa73af67fa634d33de9bf874ab" UNIQUE ("name"), CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twoFactorEnabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sessionTimeout" integer NOT NULL DEFAULT '30'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "loginNotifications" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "recoveryEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "recoveryPhone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "planId" uuid`);
        await queryRunner.query(`ALTER TABLE "usage" ADD CONSTRAINT "FK_91e198d9fab36eceba00b08f2b6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usage" ADD CONSTRAINT "FK_d2c464061093883e43e8a39038c" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_b046318e0b341a7f72110b75857" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_56f2aa669ddbe83eab8a25898b2" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_56f2aa669ddbe83eab8a25898b2"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_fb6e13226928c7ddcf2e1bf6160"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_b046318e0b341a7f72110b75857"`);
        await queryRunner.query(`ALTER TABLE "usage" DROP CONSTRAINT "FK_d2c464061093883e43e8a39038c"`);
        await queryRunner.query(`ALTER TABLE "usage" DROP CONSTRAINT "FK_91e198d9fab36eceba00b08f2b6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "planId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "recoveryPhone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "recoveryEmail"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loginNotifications"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sessionTimeout"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twoFactorEnabled"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`DROP TABLE "plan"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TABLE "usage"`);
    }

}
