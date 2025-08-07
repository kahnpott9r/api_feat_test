import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskAttachments1748346798141 implements MigrationInterface {
    name = 'TaskAttachments1748346798141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_attachment" ADD "size" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "task_attachment" ADD "mime_type" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_attachment" DROP COLUMN "mime_type"`);
        await queryRunner.query(`ALTER TABLE "task_attachment" DROP COLUMN "size"`);
    }

}
