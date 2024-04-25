import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1714036046076 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE DATABASE "node_gmp"`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP DATABASE "node_gmp"`,
        )
    }

}
