import { IsNotEmpty, Matches } from 'class-validator'

export class ResetPasswordDTO {
	@IsNotEmpty()
	@Matches(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
	password: string

	@IsNotEmpty()
	@Matches(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
	password_confirmation: string
}
