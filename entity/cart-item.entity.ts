import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Relation, ManyToOne, BaseEntity } from 'typeorm';

import { ProductEntity } from './product.entity';
import { CartEntity } from './cart.entity';
import {OrderEntity} from "./order.entity";

@Entity()
export class CartItemEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @OneToOne(() => ProductEntity, (product) => product.cartItem)
    @JoinColumn()
    product: Relation<ProductEntity>

    @Column('decimal')
    count: number;

    @ManyToOne(() => CartEntity, (cart) => cart.items, {
        cascade: true,
    })
    // @JoinColumn()
    cart: Relation<CartEntity>

    @ManyToOne(() => OrderEntity, (order) => order.items)
    @JoinColumn()
    order: Relation<OrderEntity>
}