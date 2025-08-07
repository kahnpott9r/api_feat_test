import { MigrationInterface, QueryRunner } from "typeorm";

export class PropertyAttachments1748346398078 implements MigrationInterface {
    name = 'PropertyAttachments1748346398078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "property_attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL DEFAULT 'image', "property_id" integer, "renter_id" integer, CONSTRAINT "PK_1e217c4073af944ccddbcbea8bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "property_attachment" ADD CONSTRAINT "FK_6c4147d4c3885fd818e7ed41fec" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property_attachment" ADD CONSTRAINT "FK_1fa36d1fd7a4a990647cbef66ce" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_attachment" DROP CONSTRAINT "FK_1fa36d1fd7a4a990647cbef66ce"`);
        await queryRunner.query(`ALTER TABLE "property_attachment" DROP CONSTRAINT "FK_6c4147d4c3885fd818e7ed41fec"`);
        await queryRunner.query(`DROP TABLE "property_attachment"`);
    }

}
