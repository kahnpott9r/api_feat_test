import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDifferenceFieldsToEarnE1724232186515
  implements MigrationInterface
{
  name = 'AddDifferenceFieldsToEarnE1724232186515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD "energy_delivered_tariff1_difference" numeric(12,6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD "energy_delivered_tariff2_difference" numeric(12,6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD "energy_returned_tariff1_difference" numeric(12,6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD "energy_returned_tariff2_difference" numeric(12,6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD "gas_delivered_difference" numeric(12,6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP COLUMN "gas_delivered_difference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP COLUMN "energy_returned_tariff2_difference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP COLUMN "energy_returned_tariff1_difference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP COLUMN "energy_delivered_tariff2_difference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP COLUMN "energy_delivered_tariff1_difference"`,
    );
  }
}
