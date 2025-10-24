import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullNameToUser1761268427226 implements MigrationInterface {
  name = 'AddFullNameToUser1761268427226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "fullName" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
  }
}
