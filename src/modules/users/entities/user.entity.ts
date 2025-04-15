import { AutoMap } from '@automapper/classes';
import {
  OneToMany,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { CourseEntity } from '../../courses/entities/course.entity';

@Entity('base_users')
@Unique(['auth0Id'])
export class UserEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({ unique: true, nullable: false, type: 'varchar', name: 'auth0_id' })
  auth0Id: string;

  @AutoMap()
  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @AutoMap()
  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string;

  @AutoMap()
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', name: 'backup_email', default: null })
  backupEmail: string;

  @AutoMap()
  @Column({ type: 'varchar', name: 'phone_number', default: null })
  phoneNumber: string;

  @AutoMap()
  @Column({ type: 'varchar' })
  username: string;

  @AutoMap()
  @Column({ type: 'varchar', default: null })
  avatar: string;

  @AutoMap()
  @Column({ type: 'varchar', default: null })
  description: string;

  @Column({
    type: 'varchar',
    name: 'password_hash',
    default: null,
  })
  passwordHash: string;

  @AutoMap()
  @Column({ type: 'varchar' })
  role: string;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'deleted_at', default: null })
  deletedAt: Date;

  @OneToMany(() => CourseEntity, (courseEntity) => courseEntity.user)
  courses: CourseEntity[];
}
