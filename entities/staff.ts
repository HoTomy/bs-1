import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Staff {
    @PrimaryGeneratedColumn()
    id!: number
    @Column()
    staff_code!: string
    @Column({default: false})
    is_use!: boolean
}
