import { IsPositive, Min, IsOptional } from 'class-validator'

export class GetUsersDTO {
	@Min(0)
	pageNumber: number

	@IsPositive()
	pageSize: number

	@IsOptional()
	isBlocked: boolean
}
