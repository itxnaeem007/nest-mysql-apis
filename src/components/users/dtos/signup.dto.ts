import { IsNotEmpty, IsEmail, Matches, Length, IsOptional, IsEnum } from 'class-validator'
import { USER_TYPE } from '../../../utils/enums/user.type'

export class SignupDTO {
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@Matches(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
	password: string

	@IsNotEmpty()
	@Matches(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
	password_confirmation: string

	@IsNotEmpty()
	@Length(3, 20)
	first_name: string

	@IsNotEmpty()
	@Length(3, 20)
	last_name: string

	@IsEnum(USER_TYPE)
	@IsNotEmpty()
	type: string

	@IsOptional()
	admin_secret: string

	@IsOptional()
	language: string
}
