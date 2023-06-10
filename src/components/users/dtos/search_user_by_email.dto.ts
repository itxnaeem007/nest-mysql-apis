import { IsPositive, Min, IsOptional } from 'class-validator'

export class SearchUserDTO {
	@Min(0)
	pageNumber: number

	@IsPositive()
	pageSize: number

	@IsOptional()
	email: string

	@IsOptional()
	isBlocked: boolean
}
