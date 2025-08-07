import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToTaskSupplierFK1748421825300 implements MigrationInterface {
    name = 'AddCascadeDeleteToTaskSupplierFK1748421825300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing constraint
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d"`);
        // Add the new constraint with ON DELETE CASCADE
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the CASCADE constraint
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d"`);
        // Add back the original NO ACTION constraint
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a261ab4945f6ce010c3f7a9878d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

} 