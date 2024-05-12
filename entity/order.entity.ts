import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    Relation,
    OneToMany,
    BaseEntity,
    ManyToOne
} from 'typeorm';

import { UserEntity } from './user.entity';
import { CartItemEntity } from './cart-item.entity';
import { CartEntity } from './cart.entity';
import { ORDER_STATUS } from '../interfaces/order.interface';

@Entity()
export class PaymentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column()
    type: string;

    @Column()
    address?: string;

    @Column()
    creditCard?: string;

    @OneToOne(() => OrderEntity, (order) => order.payment, {
        cascade: true,
    })
    order: Relation<OrderEntity>;
}

@Entity()
export class DeliveryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column()
    type: string;

    @Column()
    address: string;

    @OneToOne(() => OrderEntity, (order) => order.delivery, {
        cascade: true,
    })
    order: Relation<OrderEntity>;
}

@Entity()
export class OrderEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: string;

    @ManyToOne(() => UserEntity, (user) => user.orders)
    @JoinColumn()
    user: Relation<UserEntity>;

    @OneToOne(() => CartEntity, (cart) => cart.order)
    @JoinColumn()
    cart: Relation<CartEntity>;

    @OneToMany(() => CartItemEntity, (items) => items.order, {
        cascade: true,
    })
    items: Relation<CartItemEntity[]>;

    @OneToOne(() => PaymentEntity, (payment) => payment.order)
    @JoinColumn()
    payment: Relation<PaymentEntity>;

    @OneToOne(() => DeliveryEntity, (delivery) => delivery.order)
    @JoinColumn()
    delivery: Relation<DeliveryEntity>;

    @Column()
    comments: string;

    @Column({
        type: 'enum',
        enum: ['created', 'completed'],
    })
    status: ORDER_STATUS;

    @Column('decimal')
    total: number;
}