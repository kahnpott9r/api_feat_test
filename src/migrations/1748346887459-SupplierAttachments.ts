import { MigrationInterface, QueryRunner } from "typeorm";

export class SupplierAttachments1748346887459 implements MigrationInterface {
    name = 'SupplierAttachments1748346887459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "size" integer NOT NULL DEFAULT '0', "mime_type" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL DEFAULT 'image', "supplier_id" integer, CONSTRAINT "PK_d36db682590fd7cddaa7a47de85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "supplier_attachment" ADD CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_attachment" DROP CONSTRAINT "FK_01ef051449b279b3b134fe2bb3d"`);
        await queryRunner.query(`DROP TABLE "supplier_attachment"`);
    }

}
