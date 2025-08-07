import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerMortgageType1721905053767 implements MigrationInterface {
  name = 'LedgerMortgageType1721905053767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ledger" ADD "mortgage_type" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ledger" DROP COLUMN "mortgage_type"`);
  }
}
