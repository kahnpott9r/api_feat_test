import { MigrationInterface, QueryRunner } from 'typeorm';

export class EarnEPropertyEntity1723202402522 implements MigrationInterface {
  name = 'EarnEPropertyEntity1723202402522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "earn_e_property" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sw_version" integer NOT NULL, "device_id" character varying NOT NULL, "geo" json NOT NULL, "model" character varying NOT NULL, "wifi_rssi" integer NOT NULL, "energy_delivered_tariff1" numeric(12,6) NOT NULL, "energy_delivered_tariff2" numeric(12,6) NOT NULL, "energy_returned_tariff1" numeric(12,6) NOT NULL, "energy_returned_tariff2" numeric(12,6) NOT NULL, "gas_delivered" numeric(12,6) NOT NULL, "power_delivered" numeric(12,6) NOT NULL, "power_returned" numeric(12,6) NOT NULL, "voltage_l1" numeric(12,6) NOT NULL, "voltage_l2" numeric(12,6) NOT NULL, "voltage_l3" numeric(12,6) NOT NULL, "current_l1" numeric(12,6) NOT NULL, "current_l2" numeric(12,6) NOT NULL, "current_l3" numeric(12,6) NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "property_id" integer, CONSTRAINT "PK_981ea8f3f426c8a3abfd0a173c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" ADD CONSTRAINT "FK_a1ee730cf7c125884750c7b7d6b" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "earn_e_property" DROP CONSTRAINT "FK_a1ee730cf7c125884750c7b7d6b"`,
    );
    await queryRunner.query(`DROP TABLE "earn_e_property"`);
  }
}
