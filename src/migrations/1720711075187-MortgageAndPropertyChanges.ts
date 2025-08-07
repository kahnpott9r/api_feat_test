import { MigrationInterface, QueryRunner } from 'typeorm';

export class MortgageAndPropertyChanges1720711075187
  implements MigrationInterface
{
  name = 'MortgageAndPropertyChanges1720711075187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mortgage_line" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "start_date" TIMESTAMP, "end_date" TIMESTAMP, "type" character varying NOT NULL DEFAULT 'Annuity', "amount" numeric(10,2) NOT NULL DEFAULT '0', "interest_rate" numeric(10,2) NOT NULL DEFAULT '0', "duration" integer, "monthly_payment" numeric(10,2), "accumulated_amount" numeric(10,2) NOT NULL DEFAULT '0', "part" integer, "property_id" integer, CONSTRAINT "PK_82d65a51780c1eafe4d796792d8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "purchase_value" numeric(10,2) DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "market_value" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "woz_value" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_insulation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_insulation" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "mortgage_line" ADD CONSTRAINT "FK_fea56146a7ce96250585c90466f" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mortgage_line" DROP CONSTRAINT "FK_fea56146a7ce96250585c90466f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "energy_insulation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "energy_insulation" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "woz_value"`);
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "market_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "purchase_value"`,
    );
    await queryRunner.query(`DROP TABLE "mortgage_line"`);
  }
}
