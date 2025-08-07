import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerThirdPartyReferenceInterest1721895948275
  implements MigrationInterface
{
  name = 'LedgerThirdPartyReferenceInterest1721895948275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mortgage_interest" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "amount" numeric(10,2) NOT NULL DEFAULT '0', "mortgage_line_id" integer, CONSTRAINT "PK_b51b13a1a70187e9f9dfb2ae970" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" ADD "third_party_reference" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "mortgage_interest" ADD CONSTRAINT "FK_875264b08034f157f4352714133" FOREIGN KEY ("mortgage_line_id") REFERENCES "mortgage_line"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mortgage_interest" DROP CONSTRAINT "FK_875264b08034f157f4352714133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" DROP COLUMN "third_party_reference"`,
    );
    await queryRunner.query(`DROP TABLE "mortgage_interest"`);
  }
}
