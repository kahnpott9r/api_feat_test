import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1693423412059 implements MigrationInterface {
  name = 'Initial1693423412059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "refresh_token" character varying NOT NULL, "valid_until" TIMESTAMP WITH TIME ZONE, "user_id" integer, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_info" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "avatar" character varying NOT NULL DEFAULT '', "sex" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_273a06d6cdc2085ee1ce7638b24" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL DEFAULT '', "user_info_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_ee24a311e8099f9f44424df108" UNIQUE ("user_info_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role" ("id" SERIAL NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "user_id" integer, "tenant_id" integer, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "opp_provider" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "chamber_number" character varying NOT NULL, "vat_number" character varying NOT NULL, "country" character varying NOT NULL, "merchant_id" character varying, "merchant_status" character varying NOT NULL DEFAULT '', "merchant_type" character varying NOT NULL DEFAULT '', "compliance_status" character varying NOT NULL DEFAULT '', "compliance_level" integer NOT NULL DEFAULT '0', "compliance_overview_url" character varying NOT NULL DEFAULT '', "bank_id" character varying NOT NULL DEFAULT '', "bank_verify_url" character varying NOT NULL DEFAULT '', "bank_status" character varying NOT NULL DEFAULT 'new', "contact_id" character varying NOT NULL DEFAULT '', "contact_verify_url" character varying NOT NULL DEFAULT '', "contact_status" character varying NOT NULL DEFAULT 'unverified', "tenant_id" integer, CONSTRAINT "REL_69e4f5b4af066cffa8ddfcbfe3" UNIQUE ("tenant_id"), CONSTRAINT "PK_0841b433bbf11b1efd4d4511b3e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "finance" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'manual', "payment_method" character varying NOT NULL DEFAULT '', "transaction_id" character varying NOT NULL DEFAULT '', "payment_url" character varying NOT NULL DEFAULT '', "logistical_items" json, "exact" json, "paid_at" TIMESTAMP, "open_amount" numeric(10,2) NOT NULL DEFAULT '0', "property_id" integer, "renter_id" integer, "agreement_id" integer, "tenant_id" integer, CONSTRAINT "PK_e748b2c24804fde15d4d6d0e408" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "agreement" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "payment_method" character varying NOT NULL DEFAULT 'manual', "payment_date" integer NOT NULL DEFAULT '0', "start_date" TIMESTAMP, "end_date" TIMESTAMP, "ended_date" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'active', "primary_renter_id" integer, "property_id" integer, "tenant_id" integer, CONSTRAINT "PK_e7537188219eeef56233a609753" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "type" character varying NOT NULL DEFAULT 'image', "property_id" integer, "renter_id" integer, CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_entity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "property_id" integer, "renter_id" integer, CONSTRAINT "PK_664c6fdaf79389734ae737f7d27" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "renter" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL DEFAULT '', "avatar" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL, "phone" character varying NOT NULL, "gender" character varying NOT NULL DEFAULT 'Male', "invoice_email" character varying NOT NULL, "invoice_street" character varying NOT NULL, "invoice_housenumber" character varying NOT NULL, "invoice_extensions" character varying NOT NULL, "invoice_zipcode" character varying NOT NULL, "invoice_city" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'Consumer', "iban" character varying NOT NULL DEFAULT '', "company_name" character varying, "birth_day" character varying, "kvk" character varying, "tax_id" character varying, "exact_id" character varying, "tenant_id" integer, "logistical_items_id" integer, CONSTRAINT "PK_7d1963dd773c2a2a44fc93a956f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_code" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "percentage" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_b88090db24cb4910e8ff47f1946" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "logistical_item" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying, "amount" numeric(10,2) NOT NULL DEFAULT '0', "type" character varying NOT NULL DEFAULT 'rent', "agreement_id" integer, "tenant_id" integer, "tax_code_id" integer, CONSTRAINT "PK_a88477694444a0bd14c931a513e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL DEFAULT '', "avatar" character varying, "type" character varying NOT NULL DEFAULT 'Consumer', "phone" character varying NOT NULL DEFAULT '', "mobile" character varying NOT NULL DEFAULT '', "street" character varying NOT NULL DEFAULT '', "housenumber" character varying NOT NULL DEFAULT '', "extensions" character varying NOT NULL DEFAULT '', "zipcode" character varying NOT NULL DEFAULT '', "city" character varying NOT NULL DEFAULT '', "iban" character varying NOT NULL DEFAULT '', "kvk" character varying NOT NULL DEFAULT '', "tax_id" character varying NOT NULL DEFAULT '', "exact_storage" jsonb, "opp_payment_id" integer, CONSTRAINT "REL_99fedb170fec0e5f256cf36e16" UNIQUE ("opp_payment_id"), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "property_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_eb483bf7f6ddf612998949edd26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_request" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_auto" boolean NOT NULL DEFAULT false, "amount" numeric(10,2) NOT NULL DEFAULT '0', "property_id" integer, "tenant_id" integer, CONSTRAINT "PK_b274a8e7b35dd0fd12e46e89f3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ledger" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "kind" character varying NOT NULL DEFAULT 'Revenues', "duration" character varying NOT NULL DEFAULT 'PeriodicUnKnown', "amount" numeric(10,2) NOT NULL DEFAULT '0', "start_date" TIMESTAMP, "end_date" TIMESTAMP, "description" character varying, "property_id" integer, "tenant_id" integer, CONSTRAINT "PK_7a322e9157e5f42a16750ba2a20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "property" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "country" character varying NOT NULL, "street" character varying NOT NULL, "city" character varying NOT NULL, "zip_code" character varying NOT NULL, "house_number" character varying NOT NULL, "extension" character varying NOT NULL, "size" integer NOT NULL DEFAULT '0', "plot_size" integer NOT NULL DEFAULT '0', "rooms_number" integer NOT NULL DEFAULT '0', "workroom_number" integer NOT NULL DEFAULT '0', "bedroom_number" integer NOT NULL DEFAULT '0', "bathroom_number" integer NOT NULL DEFAULT '0', "year" integer NOT NULL DEFAULT '1990', "energy_level" character varying NOT NULL DEFAULT '', "energy_insulation" character varying, "energy_heating" character varying NOT NULL DEFAULT '', "type_id" integer, "tenant_id" integer, CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "priority" character varying NOT NULL DEFAULT 'Low', "status" character varying NOT NULL DEFAULT 'Open', "started_at" TIMESTAMP, "deadline_at" TIMESTAMP, "property_id" integer, "tenant_id" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "url" character varying, "type" character varying NOT NULL DEFAULT 'Normal', "tenant_id" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "agreement_renters_renter" ("agreement_id" integer NOT NULL, "renter_id" integer NOT NULL, CONSTRAINT "PK_c5b8ab491967879ceb7e9d0bf31" PRIMARY KEY ("agreement_id", "renter_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81a75e11b2329587b4d8135c33" ON "agreement_renters_renter" ("agreement_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62caaad0184bc81c6cfd4d84d2" ON "agreement_renters_renter" ("renter_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_ee24a311e8099f9f44424df108e" FOREIGN KEY ("user_info_id") REFERENCES "user_info"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" ADD CONSTRAINT "FK_45a949df1819b8e0040aace0ed1" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_provider" ADD CONSTRAINT "FK_69e4f5b4af066cffa8ddfcbfe3e" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" ADD CONSTRAINT "FK_43030cfdddececbaf26317777e5" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" ADD CONSTRAINT "FK_eb4e80081c11f032cb7c9b3062d" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" ADD CONSTRAINT "FK_3337259e673c1603f0d560610b5" FOREIGN KEY ("agreement_id") REFERENCES "agreement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" ADD CONSTRAINT "FK_b7e78e2e593cc03bca0be6a2a8a" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" ADD CONSTRAINT "FK_6737779ab9e663878f9b211202c" FOREIGN KEY ("primary_renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" ADD CONSTRAINT "FK_55612b2726a0df8fcef6d5d653e" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" ADD CONSTRAINT "FK_b9c0d408018950a35e740529623" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_entity" ADD CONSTRAINT "FK_9cae35e86ec9df944f03ba49c97" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_entity" ADD CONSTRAINT "FK_e89efc7c846c475ea5c93e6f612" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "renter" ADD CONSTRAINT "FK_bda6e8c1fbb4e8cba14fe1cd6b6" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "renter" ADD CONSTRAINT "FK_3904dc68f1c0aff8f73ef6ba510" FOREIGN KEY ("logistical_items_id") REFERENCES "logistical_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" ADD CONSTRAINT "FK_8c33eaa31fe8fca2c7d9ff17e8f" FOREIGN KEY ("agreement_id") REFERENCES "agreement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" ADD CONSTRAINT "FK_718a717f4c1915ad95be57a6e23" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" ADD CONSTRAINT "FK_ac8690b3bfbf250dcd67e37fb6d" FOREIGN KEY ("tax_code_id") REFERENCES "tax_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" ADD CONSTRAINT "FK_99fedb170fec0e5f256cf36e166" FOREIGN KEY ("opp_payment_id") REFERENCES "opp_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_request" ADD CONSTRAINT "FK_ed8eb98ecbdc3ad789126f8a3d7" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_request" ADD CONSTRAINT "FK_a4f173ecbb3fe4a6f8cc153b4b9" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" ADD CONSTRAINT "FK_a3cca48a17b37025f9340eaa730" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" ADD CONSTRAINT "FK_dd75a0f190b4b0f30e6a3855df6" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_eb483bf7f6ddf612998949edd26" FOREIGN KEY ("type_id") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_f2e57c1cc82cde8a4be70066eda" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3dab3f23e466bb2a5d90491f954" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_170e4a4133f187c90053c517dd8" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_90159456567292d863070717e35" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement_renters_renter" ADD CONSTRAINT "FK_81a75e11b2329587b4d8135c331" FOREIGN KEY ("agreement_id") REFERENCES "agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement_renters_renter" ADD CONSTRAINT "FK_62caaad0184bc81c6cfd4d84d20" FOREIGN KEY ("renter_id") REFERENCES "renter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agreement_renters_renter" DROP CONSTRAINT "FK_62caaad0184bc81c6cfd4d84d20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement_renters_renter" DROP CONSTRAINT "FK_81a75e11b2329587b4d8135c331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_90159456567292d863070717e35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_170e4a4133f187c90053c517dd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_3dab3f23e466bb2a5d90491f954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_f2e57c1cc82cde8a4be70066eda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP CONSTRAINT "FK_eb483bf7f6ddf612998949edd26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" DROP CONSTRAINT "FK_dd75a0f190b4b0f30e6a3855df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ledger" DROP CONSTRAINT "FK_a3cca48a17b37025f9340eaa730"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_request" DROP CONSTRAINT "FK_a4f173ecbb3fe4a6f8cc153b4b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_request" DROP CONSTRAINT "FK_ed8eb98ecbdc3ad789126f8a3d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant" DROP CONSTRAINT "FK_99fedb170fec0e5f256cf36e166"`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" DROP CONSTRAINT "FK_ac8690b3bfbf250dcd67e37fb6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" DROP CONSTRAINT "FK_718a717f4c1915ad95be57a6e23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "logistical_item" DROP CONSTRAINT "FK_8c33eaa31fe8fca2c7d9ff17e8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "renter" DROP CONSTRAINT "FK_3904dc68f1c0aff8f73ef6ba510"`,
    );
    await queryRunner.query(
      `ALTER TABLE "renter" DROP CONSTRAINT "FK_bda6e8c1fbb4e8cba14fe1cd6b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_entity" DROP CONSTRAINT "FK_e89efc7c846c475ea5c93e6f612"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_entity" DROP CONSTRAINT "FK_9cae35e86ec9df944f03ba49c97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" DROP CONSTRAINT "FK_b9e3f16c1872dca3ed8ad924466"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" DROP CONSTRAINT "FK_deb2b79b70084daefc40b6c15a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" DROP CONSTRAINT "FK_b9c0d408018950a35e740529623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" DROP CONSTRAINT "FK_55612b2726a0df8fcef6d5d653e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agreement" DROP CONSTRAINT "FK_6737779ab9e663878f9b211202c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" DROP CONSTRAINT "FK_b7e78e2e593cc03bca0be6a2a8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" DROP CONSTRAINT "FK_3337259e673c1603f0d560610b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" DROP CONSTRAINT "FK_eb4e80081c11f032cb7c9b3062d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "finance" DROP CONSTRAINT "FK_43030cfdddececbaf26317777e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "opp_provider" DROP CONSTRAINT "FK_69e4f5b4af066cffa8ddfcbfe3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_45a949df1819b8e0040aace0ed1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_ee24a311e8099f9f44424df108e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62caaad0184bc81c6cfd4d84d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81a75e11b2329587b4d8135c33"`,
    );
    await queryRunner.query(`DROP TABLE "agreement_renters_renter"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TABLE "property"`);
    await queryRunner.query(`DROP TABLE "ledger"`);
    await queryRunner.query(`DROP TABLE "payment_request"`);
    await queryRunner.query(`DROP TABLE "property_type"`);
    await queryRunner.query(`DROP TABLE "tenant"`);
    await queryRunner.query(`DROP TABLE "logistical_item"`);
    await queryRunner.query(`DROP TABLE "tax_code"`);
    await queryRunner.query(`DROP TABLE "renter"`);
    await queryRunner.query(`DROP TABLE "note_entity"`);
    await queryRunner.query(`DROP TABLE "attachment"`);
    await queryRunner.query(`DROP TABLE "agreement"`);
    await queryRunner.query(`DROP TABLE "finance"`);
    await queryRunner.query(`DROP TABLE "opp_provider"`);
    await queryRunner.query(`DROP TABLE "user_role"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_info"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
