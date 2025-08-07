import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration1744102887069 implements MigrationInterface {
  name = 'TestMigration1744102887069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'image', "task_id" integer, CONSTRAINT "PK_b9dd4c7184d6c02636decffa219" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachment" ADD CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_attachment" DROP CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669"`,
    );
    await queryRunner.query(`DROP TABLE "task_attachment"`);
  }
}
