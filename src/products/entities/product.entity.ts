import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Wholesaler } from '../../wholesalers/entities/wholesaler.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Index()
  @Column() category: string;

  @Column('int') price: number;   // KES
  @Column('int') bulkQty: number; // e.g. 50 for a 50kg bag
  @Column() unit: string;         // "Bag (50kg)", "Bales (2kg x 24)"

  @Column('int', { default: 0 }) stock: number;

  @ManyToOne(() => Wholesaler, (w) => w.products)
  wholesaler: Wholesaler;

  @Column('uuid')
  wholesalerId: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('uuid', { nullable: true })
  cheaperAlternativeId: string | null; // powers the "Mshauri" price-match suggestion
}
