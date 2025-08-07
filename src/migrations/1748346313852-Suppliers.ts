import { MigrationInterface, QueryRunner } from "typeorm";

export class Suppliers1748346313852 implements MigrationInterface {
    name = 'Suppliers1748346313852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "company_name" character varying NOT NULL DEFAULT '', "phone" character varying NOT NULL, "website" character varying NOT NULL, "invoice_email" character varying NOT NULL, "invoice_street" character varying NOT NULL, "invoice_housenumber" character varying NOT NULL, "invoice_extensions" character varying NOT NULL, "invoice_zipcode" character varying NOT NULL, "invoice_city" character varying NOT NULL, "iban" character varying, "contact" json, "coc_number" character varying, "type" integer NOT NULL DEFAULT '10', "status" integer NOT NULL DEFAULT '0', "tenant_id" integer, CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD CONSTRAINT "FK_143dc0e7f2f449e4b04b1d5cc71" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP CONSTRAINT "FK_143dc0e7f2f449e4b04b1d5cc71"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
    }

}
