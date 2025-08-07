import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEarnEColumnToPropertyAndTenant1724412326658
  implements MigrationInterface
{
  name = 'AddEarnEColumnToPropertyAndTenant1724412326658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD "has_earn_e" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "has_earn_e" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "has_earn_e"`);
    await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "has_earn_e"`);
  }
}
