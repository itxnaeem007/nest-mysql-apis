import { IsNotEmpty, IsEmail, IsOptional, Matches, IsNumber } from 'class-validator'

export class LoginDTO {
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@Matches(/^((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,30})$/)
	password: string

	@IsNotEmpty()
	@IsOptional()
	@Matches(/-----BEGIN PUBLIC KEY-----\n(.*)\n-----END PUBLIC KEY-----/s)
	encryption_public_key: string

	@IsOptional()
	@IsNumber()
	google_2fa_code: number
}
