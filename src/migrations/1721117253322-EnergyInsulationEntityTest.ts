import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnergyInsulationEntityTest1721117253322
  implements MigrationInterface
{
  name = 'EnergyInsulationEntityTest1721117253322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_2e45f7a757b61b5a6f55c1cdee3"`,
    );
    await queryRunner.query(
      `CREATE TABLE "property_energy_insulation_energy_insulation" ("property_id" integer NOT NULL, "energy_insulation_id" integer NOT NULL, CONSTRAINT "PK_c01a571653fca7d1734bea732a6" PRIMARY KEY ("property_id", "energy_insulation_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38e5dc9148b002c7b9a2e60151" ON "property_energy_insulation_energy_insulation" ("property_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aac4c3fb7d3b0d2ba61ca8812f" ON "property_energy_insulation_energy_insulation" ("energy_insulation_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_insulation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_energy_insulation_energy_insulation" ADD CONSTRAINT "FK_38e5dc9148b002c7b9a2e601515" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_energy_insulation_energy_insulation" ADD CONSTRAINT "FK_aac4c3fb7d3b0d2ba61ca8812ff" FOREIGN KEY ("energy_insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property_energy_insulation_energy_insulation" DROP CONSTRAINT "FK_aac4c3fb7d3b0d2ba61ca8812ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_energy_insulation_energy_insulation" DROP CONSTRAINT "FK_38e5dc9148b002c7b9a2e601515"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_insulation_id" integer`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aac4c3fb7d3b0d2ba61ca8812f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38e5dc9148b002c7b9a2e60151"`,
    );
    await queryRunner.query(
      `DROP TABLE "property_energy_insulation_energy_insulation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_2e45f7a757b61b5a6f55c1cdee3" FOREIGN KEY ("energy_insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
