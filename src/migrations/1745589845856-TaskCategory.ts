import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskCategory1745589845856 implements MigrationInterface {
    name = 'TaskCategory1745589845856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP COLUMN "property_id"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP COLUMN "renter_id"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "category" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sub_category" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD "property_id" integer`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD "renter_id" integer`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP COLUMN "renter_id"`);
        await queryRunner.query(`ALTER TABLE "attachment" DROP COLUMN "property_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sub_category"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD "renter_id" integer`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD "property_id" integer`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attachment" ADD CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
