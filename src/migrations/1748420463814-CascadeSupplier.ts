import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeSupplier1748420463814 implements MigrationInterface {
    name = 'CascadeSupplier1748420463814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_attachment" DROP CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669"`);
        await queryRunner.query(`ALTER TABLE "supplier_attachment" DROP CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "category" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "sub_category" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "task_attachment" ADD CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_attachment" ADD CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_attachment" DROP CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d"`);
        await queryRunner.query(`ALTER TABLE "task_attachment" DROP CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "sub_category" SET DEFAULT '33'`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "category" SET DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE "supplier_attachment" ADD CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_attachment" ADD CONSTRAINT "FK_81bb33ae540bb0e3fc7fc4f9669" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
