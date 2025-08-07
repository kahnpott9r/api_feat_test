import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierNotesAndHourlyRate1748848129400 implements MigrationInterface {
    name = 'SupplierNotesAndHourlyRate1748848129400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d"`);
        await queryRunner.query(`ALTER TABLE "note_entity" ADD "supplier_id" integer`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "hourly_rate" integer`);
        await queryRunner.query(`ALTER TABLE "note_entity" ADD CONSTRAINT "FK_15cbf23d2256ae9d97baa2037d8" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d"`);
        await queryRunner.query(`ALTER TABLE "note_entity" DROP CONSTRAINT "FK_15cbf23d2256ae9d97baa2037d8"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "hourly_rate"`);
        await queryRunner.query(`ALTER TABLE "note_entity" DROP COLUMN "supplier_id"`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
