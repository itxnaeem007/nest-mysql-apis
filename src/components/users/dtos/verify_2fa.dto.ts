import { IsNumber, Length } from 'class-validator'
export class Verify2FADTO {
	@IsNumber()
	code: number
}
