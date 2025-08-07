import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskOverhaul1748346945641 implements MigrationInterface {
    name = 'TaskOverhaul1748346945641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "scheduled_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "supplier_id" integer`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "status" integer NOT NULL DEFAULT '0'`);
        
        // Handle category conversion with null value cleanup
        await queryRunner.query(`UPDATE "task" SET "category" = 'OTHER' WHERE "category" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "category" integer NOT NULL DEFAULT '3'`);
        
        // Handle sub_category conversion with null value cleanup
        await queryRunner.query(`UPDATE "task" SET "sub_category" = 'GENERAL' WHERE "sub_category" IS NULL`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sub_category"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sub_category" integer DEFAULT '33'`);
        
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sub_category"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sub_category" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "category" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "status" character varying NOT NULL DEFAULT 'Open'`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" character varying NOT NULL DEFAULT 'Low'`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "supplier_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "completed_at"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "scheduled_at"`);
    }

}
