import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761264702243 implements MigrationInterface {
  name = 'InitialSchema1761264702243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "smtp_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "host" character varying NOT NULL, "port" integer NOT NULL, "email" character varying NOT NULL, "passwordEncrypted" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_a6ecb3239c7ac2d9a47bddab934" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "subject" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "keyHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "UQ_df3b25181df0b4b59bd93f16e10" UNIQUE ("keyHash"), CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "subject" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "smtp_configs" ADD CONSTRAINT "FK_0d010fc3f6a8c0cade9eb6f094e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" ADD CONSTRAINT "FK_7193babbf16087eb6107606dfe3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_6c2e267ae764a9413b863a29342" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_logs" ADD CONSTRAINT "FK_f61d9dd316d1a2c30bb55ed7579" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" ADD CONSTRAINT "FK_82b0deb105275568cdcef2823eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otps" DROP CONSTRAINT "FK_82b0deb105275568cdcef2823eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_logs" DROP CONSTRAINT "FK_f61d9dd316d1a2c30bb55ed7579"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" DROP CONSTRAINT "FK_6c2e267ae764a9413b863a29342"`,
    );
    await queryRunner.query(
      `ALTER TABLE "templates" DROP CONSTRAINT "FK_7193babbf16087eb6107606dfe3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smtp_configs" DROP CONSTRAINT "FK_0d010fc3f6a8c0cade9eb6f094e"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP TABLE "email_logs"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "templates"`);
    await queryRunner.query(`DROP TABLE "smtp_configs"`);
  }
}
