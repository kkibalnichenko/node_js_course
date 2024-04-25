import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Relation, OneToMany, BaseEntity } from 'typeorm';
import { v4 } from 'uuid';

import { UserEntity } from './user.entity';
import { CartItemEntity } from './cart-item.entity';
import { OrderEntity } from './order.entity';

@Entity()
export class CartEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column({
        unique: true,
    })
    id: string = v4();

    @OneToOne(() => UserEntity, (user) => user.cart)
    @JoinColumn()
    user: Relation<UserEntity>;

    @Column()
    isDeleted: boolean;

    // @OneToMany(() => CartItemEntity, (items) => items.cart, {
    //     cascade: true,
    // })
    // items: Relation<CartItemEntity[]>;
    @OneToMany(() => CartItemEntity, (items) => items.cart)
    @JoinColumn()
    items: Relation<CartItemEntity[]>;

    @OneToOne(() => OrderEntity, (order) => order.cart, {
        cascade: true,
    })
    order: Relation<OrderEntity>;
}