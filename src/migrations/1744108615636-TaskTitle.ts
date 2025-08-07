import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskTitle1744108615636 implements MigrationInterface {
  name = 'TaskTitle1744108615636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "title"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "title" character varying NOT NULL`,
    );
  }
}
