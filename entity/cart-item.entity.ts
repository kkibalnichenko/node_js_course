import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Relation, ManyToOne, BaseEntity } from 'typeorm';

import { ProductEntity } from './product.entity';
import { CartEntity } from './cart.entity';

@Entity()
export class CartItemEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @OneToOne(() => ProductEntity)
    @JoinColumn()
    product: Relation<ProductEntity>

    @Column('decimal')
    count: number;

    @ManyToOne(() => CartEntity, (cart) => cart.items)
    @JoinColumn()
    cart: Relation<CartEntity>
}