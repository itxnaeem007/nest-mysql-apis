import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../entities/users.entity'
import * as jwt from 'jsonwebtoken'
import { RESPONSE_MESSAGES } from '../../../utils/enums/response.messages'
import { Translator } from '../../../utils/helpers/translator'
import { Mailer } from '../../../utils/email/mailer'
import { Exceptions } from '../../../utils/exceptions/exceptions'
import { createJwtToken } from '../../../utils/helpers/make.jwt.token'
import { dateDiffInMins } from '../../../utils/helpers/date.diff.in.mins'
import { SharedService } from './../../../components/shared/services/shared.service'

@Injectable()
export class UserVerificationService {
	resendEmailVerificationDelay: Map<number, Date> = new Map()
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly sharedService: SharedService
	) { }

	/**
	 * @description verify email
	 * @param jwtToken jwt token
	 * @returns success messgae if all things happend well otherwise throw exception and token
	 * @author Zaigham Javed
	 */
	async verifyEmail(jwtToken: string): Promise<{ message: string; token: string }> {
		try {
			const decodedObj: Object = jwt.verify(jwtToken, process.env.JWT_TOKEN)
			if (!decodedObj['verifyEmail']) {
				Exceptions.sendNotAcceptableException(
					Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, decodedObj['language'])
				)
			}

			let user = await this.usersRepository.findOne({
				where: {
					email: decodedObj['email'],
				},
			})
			if (!user) {
				Exceptions.sendNotFoundException(Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, user.language))
			}

			user.email_verified_at = new Date()
			user.updated_at = new Date()
			user = await this.usersRepository.save(user)

			// delete it from storage to free memory
			this.resendEmailVerificationDelay.delete(user.id)

			const token = jwt.sign(
				{
					email: user.email,
					language: user.language,
					name: user.first_name,
				},
				process.env.JWT_TOKEN,
				{ expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME } // JWT_EXPIRES_TIME in seconds,
			)

			return {
				message: Translator.translate(RESPONSE_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY, user.language),
				token: token,
			}
		} catch (error) {
			this.sharedService.sendError(error, 'verifyEmail')
		}
	}

	/**
	 * @description resend email verification request
	 * @param email email
	 * @author Zaigham Javed
	 */
	async verifyEmailResendRequest(email: string): Promise<{ message: string }> {
		try {
			const user = await this.usersRepository.findOne({
				where: {
					email: email,
				},
			})
			if (!user) {
				Exceptions.sendNotFoundException(Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, user.language))
			}

			if (user.email_verified_at) {
				Exceptions.sendConflictException(Translator.translate(RESPONSE_MESSAGES.ALREADY_VERIFIED, user.language))
			}
			if (this.resendEmailVerificationDelay.has(user.id)) {
				const timeDiff: number = await dateDiffInMins(
					this.resendEmailVerificationDelay.get(user.id), new Date()
				)
				if (timeDiff < 5) {
					Exceptions.sendForbiddenException(
						Translator.translate(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN, user.language)
					)
				}
			}
			this.verifyEmailRequest(user)

			return {
				message: Translator.translate(RESPONSE_MESSAGES.VERIFICATION_EMAIL_SENT, user.language),
			}
		} catch (error) {
			this.sharedService.sendError(error, 'verifyEmailResendRequest')
		}
	}

	/**
	 * @description send account verification email to user
	 * @param user user
	 * @author Zaigham Javed
	 */
	async verifyEmailRequest(user: User): Promise<boolean> {
		try {
			const token: string = jwt.sign({ ...user, verifyEmail: true }, process.env.JWT_TOKEN, {
				expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME,
			})

			const verifyEmailUrl = `${process.env.USER_ACCOUNT_VERIFICATION_PAGE}?token=${token}`

			console.log('VERIFY TOKEN', user.email, '((((', token, ')))))')
			const res: boolean = await Mailer.verificatoinEmail(user.email, user.first_name, verifyEmailUrl)
			return res
		} catch (error) {
			this.sharedService.sendError(error, 'verifyEmailRequest')
		}
	}

	/**
	 * @description get new jwt token if it is valid and expired
	 * @param request
	 * @author Zaigham Javed
	 */
	async getNewJwtToken(request) {
		try {
			// Checking if token exists
			if (!request.headers.authorization) {
				Exceptions.sendUnauthorizedException(
					Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, process.env.DEFAULT_LANGUAGE)
				)
			}

			try {
				const decodedToken: Object = jwt.verify(request.headers.authorization, process.env.JWT_TOKEN)
				return request.headers.authorization
			} catch (error) {
				if (error.name == 'TokenExpiredError') {
					console.log('token expired')
					const decodedToken: Object = jwt.verify(request.headers.authorization, process.env.JWT_TOKEN, {
						ignoreExpiration: true,
					})

					const user: User = await this.usersRepository.findOne({
						where: {
							email: decodedToken['email'],
						},
					})

					if (!user) {
						Exceptions.sendUnauthorizedException(
							Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, process.env.DEFAULT_LANGUAGE)
						)
					}

					if (user.ip_address !== decodedToken['ip_address'] || user.jwt_token !== request.headers.authorization) {
						Exceptions.sendUnauthorizedException(Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, user.language))
					}

					const token: string = createJwtToken(user)
					user.jwt_token = token
					await this.usersRepository.update(
						{
							id: user.id,
						},
						{
							jwt_token: token,
						}
					)

					return token
				}
			}
		} catch (error) {
			this.sharedService.sendError(error, 'getNewJwtToken')
		}
	}

	/**
	 * @description check user exist or not by email
	 * @param email user Email
	 * @author Zaigham Javed
	 */
	async isUserExist(email: string): Promise<boolean> {
		try {
			const user: User = await this.usersRepository.findOne({
				where: {
					email: email,
				},
			})

			if (!user) {
				return false
			}
			return true
		} catch (error) {
			this.sharedService.sendError(error, 'isUserExist')
		}
	}
}
