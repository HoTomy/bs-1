import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id!: number
  @Column()
  username!: string
  @Column()
  password!: string
  @Column()
  password_salt!: string
  @Column()
  email!: string
  @Column({ nullable: true })
  avatar!: string
  @Column({ default: 0 })
  gender!: number
  @Column({ nullable: true })
  nickname!: string
  @CreateDateColumn()
  created_at!: Date
  @UpdateDateColumn()
  updated_at!: Date
  @Column({ nullable: true })
  last_login!: Date
  @Column({ default: false })
  is_verified!: boolean
  @Column({ default: true })
  is_active!: boolean
  @Column({ nullable: true })
  provider!: string
  @Column({ nullable: true })
  staff_code!: string
}