import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRole1761802685587 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users
      SET role = 'admin'
      WHERE email = 'eg3744844@gmail.com'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE users
      SET role = 'user'
      WHERE email = 'eg3744844@gmail.com'
    `);
  }
}
