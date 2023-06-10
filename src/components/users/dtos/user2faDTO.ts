import { IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
export class User2FADTO {

		@IsNumber()
		@Type(() => Number)
		google_2fa_code: number
}
