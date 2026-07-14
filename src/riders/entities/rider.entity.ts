import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RiderStatus {
  OFFLINE = 'offline',
  AVAILABLE = 'available',
  ON_JOB = 'on_job',
}

@Entity('riders')
export class Rider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Column() phone: string;
  @Column() vehicle: string;

  @Column({ type: 'enum', enum: RiderStatus, default: RiderStatus.OFFLINE })
  status: RiderStatus;

  // Updated frequently by a lightweight PATCH /riders/:id/location — keep this table narrow.
  @Column('float', { nullable: true }) lat: number | null;
  @Column('float', { nullable: true }) lng: number | null;

  @Column('float', { default: 0 }) rating: number;
  @Column('int', { default: 0 }) earningsToday: number;
  @Column('int', { default: 0 }) completedTrips: number;
}
