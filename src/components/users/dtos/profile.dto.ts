import { IsNotEmpty, Length, IsOptional, IsString } from 'class-validator'

export class ProfileDTO {
	@IsOptional()
	@IsString()
	@Length(3, 20)
	name: string
}
