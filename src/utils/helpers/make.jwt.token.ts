import * as jwt from 'jsonwebtoken'
import { User } from '../../entities/users.entity'

export const createJwtToken = (user: User) => {
	const jwtObj: Object = {
		email: user.email,
		first_name: user.first_name,
		ip_address: user.ip_address,
		language: user.language,
	}
	return jwt.sign(
		{
			...jwtObj,
		},
		process.env.JWT_TOKEN,
		{
			expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME,
		}
	)
}
