import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnergyInsulationEntity1721114172015 implements MigrationInterface {
  name = 'EnergyInsulationEntity1721114172015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "energy_insulation" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_be524a19807751c52154ca41d0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "insulation_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15" FOREIGN KEY ("insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "insulation_id"`,
    );
    await queryRunner.query(`DROP TABLE "energy_insulation"`);
  }
}
