import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum SubscriptionPlan {
  FREE = 'free',
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise',
}

@Entity('wholesalers')
export class Wholesaler {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Column() phone: string;

  // Money truth lives here, never derived on the frontend.
  @Column('int', { default: 0 }) balanceEscrow: number;
  @Column('int', { default: 0 }) balanceReleased: number;

  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  subscriptionPlan: SubscriptionPlan;

  @Column('float', { default: 0 }) rating: number;

  @OneToMany(() => Product, (p) => p.wholesaler)
  products: Product[];
}
