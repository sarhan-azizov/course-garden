import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity';
import { CourseEntity } from '../../entities/course.entity';

import { ECardsType } from '../dto';

@Entity('cards')
export class CardEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({ type: 'enum', enum: ECardsType })
  type: ECardsType;

  @AutoMap()
  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  content: string;

  @AutoMap()
  @Column({ type: 'boolean', name: 'is_active', default: false })
  isActive: boolean;

  @AutoMap()
  @Column({
    type: 'jsonb',
    name: 'content_details',
    nullable: true,
    default: null,
  })
  contentDetails: string;

  @AutoMap()
  @Column({ type: 'int4', nullable: true, default: null })
  position: number;

  @AutoMap()
  @Column({
    type: 'text',
    name: 'content_image',
    nullable: true,
    default: null,
  })
  contentImage: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'creator_id' })
  user: UserEntity;

  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'deleted_at', default: null })
  deletedAt: Date;
}
