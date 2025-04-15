import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { CardEntity } from '../cards/entities/card.entity';

@Entity('courses')
export class CourseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @AutoMap()
  @Column({ type: 'varchar' })
  description: string;

  @AutoMap()
  @Column({ type: 'boolean', name: 'is_public', default: true })
  isPublic: boolean;

  @AutoMap()
  @Column({ type: 'boolean', name: 'is_active', default: false })
  isActive: boolean;

  @AutoMap()
  @Column({ nullable: true, type: 'jsonb', default: null })
  cover: string;

  @AutoMap()
  @Column({ type: 'int', name: 'number_of_views', default: 0 })
  views: number;

  @AutoMap()
  @Column({ type: 'int', name: 'number_of_reviews', default: 0 })
  reviews: number;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creator_id' })
  user: UserEntity;

  @OneToMany(() => CardEntity, (cardEntity) => cardEntity.course, {
    onDelete: 'CASCADE',
  })
  cards: CardEntity[];

  @AutoMap()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'deleted_at', default: null })
  deletedAt: Date;
}
