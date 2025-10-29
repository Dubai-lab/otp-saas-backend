import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityFieldsToUser1761640187153
  implements MigrationInterface
{
  name = 'AddSecurityFieldsToUser1761640187153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "twoFactorEnabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "sessionTimeout" integer NOT NULL DEFAULT 30`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loginNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "recoveryEmail" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "recoveryPhone" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "recoveryPhone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "recoveryEmail"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "loginNotifications"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sessionTimeout"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "twoFactorEnabled"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
  }
}
