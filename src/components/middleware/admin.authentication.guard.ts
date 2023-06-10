import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

import * as jwt from 'jsonwebtoken'
import { User } from '../../entities/users.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Exceptions } from '../../utils/exceptions/exceptions'
import { Translator } from '../../utils/helpers/translator'
import { RESPONSE_MESSAGES } from '../../utils/enums/response.messages'
import { USER_TYPE } from '../../utils/enums/user.type'
import { decrypt } from '../../utils/helpers/decrypt'

@Injectable()
export class AdminAuthenticationGuard implements CanActivate {
	constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) { }
	async canActivate(context: ExecutionContext) {
		const req: any = context.switchToHttp().getRequest()

		// Checking if token exists
		if (!req.headers.authorization) {
			throw new UnauthorizedException()
		}
		try {
			const decodedToken: Object = jwt.verify(req.headers.authorization, process.env.JWT_TOKEN)
			const user: User = await this.usersRepository.findOne({
				where: {
					email: decodedToken['email'],
					type: USER_TYPE.ADMIN,
				},
			})

			if (!user) {
				Exceptions.sendUnauthorizedException(
					Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, process.env.DEFAULT_LANGUAGE)
				)
			}

			if (user.is_blocked) {
				Exceptions.sendUnauthorizedException(
					Translator.translate(
						RESPONSE_MESSAGES.USER_IS_BLOCKED_PLEASE_CONTACT_SUPPORT,
						Boolean(user.language) ? user.language : process.env.DEFAULT_LANGUAGE
					)
				)
			}

			if (req.body && process.env.ENCRYPTION_ENABLED === 'true') {
				const res: unknown = await decrypt(req.body.data, user.decryption_private_key)
				const decryptedData = res as string
				req.body = JSON.parse(decryptedData)
			}

			req.user = user
			return true
		} catch (error) {
			console.log(error)
			Exceptions.sendUnauthorizedException(error.message)
		}
	}
}
