import { MigrationInterface, QueryRunner } from 'typeorm';

export class EarnEPropertyCurrentsNullable1723211112349
  implements MigrationInterface
{
  name = 'EarnEPropertyCurrentsNullable1723211112349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "voltage_l2" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "voltage_l3" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "current_l2" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "current_l3" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "current_l3" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "current_l2" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "voltage_l3" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ALTER COLUMN "voltage_l2" SET NOT NULL`,
    );
  }
}
