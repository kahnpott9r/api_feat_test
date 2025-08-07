import { MigrationInterface, QueryRunner } from 'typeorm';

export class NoteHistory1740483462958 implements MigrationInterface {
  name = 'NoteHistory1740483462958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if constraints exist before trying to drop them
    const constraintData1 = await queryRunner.query(
      `SELECT * FROM information_schema.table_constraints WHERE constraint_name = 'FK_9abe0fd50da14ea7117f941d0f8'`,
    );
    if (constraintData1.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "mortgage_line" DROP CONSTRAINT "FK_9abe0fd50da14ea7117f941d0f8"`,
      );
    }

    const constraintData2 = await queryRunner.query(
      `SELECT * FROM information_schema.table_constraints WHERE constraint_name = 'FK_eb972dd459752a7d1dbb21efb15'`,
    );
    if (constraintData2.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "property" DROP CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15"`,
      );
    }

    // Check if column exists before trying to drop it
    const columnData1 = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'property' AND column_name = 'insulation_id'`,
    );
    if (columnData1.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "property" DROP COLUMN "insulation_id"`,
      );
    }

    const columnData2 = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'property' AND column_name = 'title'`,
    );
    if (columnData2.length > 0) {
      await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "title"`);
    }

    await queryRunner.query(`ALTER TABLE "note_entity" ADD "history" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "note_entity" DROP COLUMN "history"`);
    await queryRunner.query(
      `ALTER TABLE "property" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "insulation_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD CONSTRAINT "FK_eb972dd459752a7d1dbb21efb15" FOREIGN KEY ("insulation_id") REFERENCES "energy_insulation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mortgage_line" ADD CONSTRAINT "FK_9abe0fd50da14ea7117f941d0f8" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
