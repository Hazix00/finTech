import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAidRequests1747699200000 implements MigrationInterface {
  name = 'CreateAidRequests1747699200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."aid_requests_category_enum" AS ENUM('HOUSING', 'FOOD', 'HEALTH', 'ENERGY', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."aid_requests_status_enum" AS ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(`
      CREATE TABLE "aid_requests" (
        "id"            uuid                                    NOT NULL DEFAULT uuid_generate_v4(),
        "beneficiaryId" uuid                                    NOT NULL,
        "category"      "public"."aid_requests_category_enum"  NOT NULL,
        "amount"        numeric(10,2)                           NOT NULL,
        "description"   text                                    NOT NULL,
        "status"        "public"."aid_requests_status_enum"     NOT NULL DEFAULT 'PENDING',
        "createdAt"     TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT now(),
        CONSTRAINT "PK_aid_requests_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "aid_requests"`);
    await queryRunner.query(`DROP TYPE "public"."aid_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."aid_requests_category_enum"`);
  }
}
