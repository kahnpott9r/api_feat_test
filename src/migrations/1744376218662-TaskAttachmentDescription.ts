import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskAttachmentDescription1744376218662
  implements MigrationInterface
{
  name = 'TaskAttachmentDescription1744376218662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_attachment" ADD "description" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_attachment" DROP COLUMN "description"`,
    );
  }
}
