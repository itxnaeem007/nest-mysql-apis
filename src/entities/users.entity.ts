import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, BeforeInsert } from 'typeorm'
import { IsString, IsOptional } from 'class-validator'
import { USER_TYPE } from '../utils/enums/user.type'
import { USER_LANGUAGE } from '../utils/enums/user.language'
import * as randomString from 'randomstring'

@Entity('users')
export class User {
	@PrimaryColumn('bigint')
	id: number

	@BeforeInsert()
	private beforeInsert() {
		this.id = randomString.generate({
			length: 10,
			charset: 'numeric',
		})
	}

	@Column({ default: '' })
	first_name: string

	@Column({ default: '' })
	last_name: string

	@IsString()
	@Column({ unique: true })
	email: string

	@Column({ select: true, nullable: true })
	email_verified_at: Date

	@IsString()
	@Column({ nullable: false })
	password: string

	@Column({
		type: 'enum',
		enum: USER_TYPE,
	})
	type: USER_TYPE

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date

	@Column()
	google2fa_secret: string

	@Column({ select: false })
	google_2fa_totp: string

	@Column({ default: false })
	is_2fa_enabled: boolean

	@Column({
		type: 'enum',
		enum: USER_LANGUAGE,
		default: USER_LANGUAGE.EN_US,
	})
	language: USER_LANGUAGE

	@Column({ default: false })
	is_blocked: boolean

	@Column({ default: '', length: 1000 })
	jwt_token: string

	@Column({ default: '' })
	ip_address: string

	@Column({ default: '', length: 1000 })
	phrase_hash: string

	@Column({ default: '', length: 10000 })
	decryption_private_key: string

	@Column({ default: '', length: 10000 })
	encryption_public_key: string

	@Column({ default: '' })
	prime: string

	constructor(raw) {
		if (raw) {
			raw.google_2fa_totp = raw.secretCode.otpauth_url
			raw.google2fa_secret = raw.secretCode.base32
			Object.assign(this, raw)
		}
	}
}
