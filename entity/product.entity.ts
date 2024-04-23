import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { v4 } from 'uuid';

@Entity()
export class ProductEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column({
        unique: true,
    })
    id: string = v4();

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('decimal')
    price: number;
}