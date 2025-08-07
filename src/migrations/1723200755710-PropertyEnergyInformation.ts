import { MigrationInterface, QueryRunner } from 'typeorm';

export class PropertyEnergyInformation1723200755710
  implements MigrationInterface
{
  name = 'PropertyEnergyInformation1723200755710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" ADD "pairing_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_supplier" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_costs" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "gas_costs" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "network_management_costs" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "network_management_costs"`,
    );
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "gas_costs"`);
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_costs"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_supplier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "pairing_code"`,
    );
  }
}
