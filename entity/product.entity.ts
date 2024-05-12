import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, Relation} from 'typeorm';
import { v4 } from 'uuid';
import {CartEntity} from "./cart.entity";
import {CartItemEntity} from "./cart-item.entity";

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

    @OneToOne(() => CartItemEntity, (cartItem) => cartItem.product, {
        cascade: true,
    })
    cartItem: Relation<CartItemEntity>;
}