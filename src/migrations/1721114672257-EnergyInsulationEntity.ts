import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnergyInsulationEntity1721114672257 implements MigrationInterface {
  name = 'EnergyInsulationEntity1721114672257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "insulation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_insulation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_insulation_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_2e45f7a757b61b5a6f55c1cdee3" FOREIGN KEY ("energy_insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_2e45f7a757b61b5a6f55c1cdee3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_insulation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_insulation" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "insulation_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15" FOREIGN KEY ("insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
