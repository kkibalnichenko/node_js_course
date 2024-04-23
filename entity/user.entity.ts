import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, Relation } from 'typeorm';
import { v4 } from 'uuid';

import { UserRoles } from '../interfaces/user.interface';
import { CartEntity } from './cart.entity';

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column({
        unique: true,
    })
    id: string = v4();

    @Column({
        type: 'varchar',
        unique: true,
    })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRoles,
    })
    role: UserRoles;

    @OneToOne(() => CartEntity, (cart) => cart.user, {
        cascade: true,
    })
    cart: Relation<CartEntity>;
}