import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column()
  content: string;

  @Column()
  category: string;

  @ManyToOne(() => User)
  @JoinColumn([{ name: "user_id" }])
  author: User;
}
