import { Injectable } from '@nestjs/common'
import { Exceptions } from '../../../utils/exceptions/exceptions'
import { RESPONSE_MESSAGES } from '../../../utils/enums/response.messages'
import { Translator } from '../../../utils/helpers/translator'
import * as jwt from 'jsonwebtoken'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../../entities/users.entity'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Mailer } from '../../../utils/email/mailer'
import { USER_TYPE } from '../../../utils/enums/user.type'
import { dateDiffInMins } from '../../../utils/helpers/date.diff.in.mins'
import { ChangePasswordDTO } from '../dtos/change_password.dto'
import { SharedService } from './../../../components/shared/services/shared.service'
@Injectable()
export class UsersPasswordService {
	forgotPassEmailVerificationDelay: Map<number, Date> = new Map()
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly sharedService: SharedService
	) { }

	/**
	 * @description reset user password
	 * @param password
	 * @param password_confirmation
	 * @param jwtToken jwt token that is received by user when he/she click on forgot password
	 * @author Zaigham Javed
	 */
	async resetPasswordRequest(
		password: string,
		password_confirmation: string,
		jwtToken: string
	): Promise<{ message: string }> {
		try {
			console.log(password, password_confirmation)
			let decodedObj: Object = undefined
			try {
				decodedObj = jwt.verify(jwtToken, process.env.JWT_TOKEN)
			} catch (error) {
				Exceptions.sendBadRequestException(
					Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, process.env.DEFAULT_LANGUAGE)
				)
			}
			if (!decodedObj['resetPassword']) {
				Exceptions.sendNotAcceptableException(
					Translator.translate(RESPONSE_MESSAGES.INVALID_TOKEN, decodedObj['language'])
				)
			}

			if (password !== password_confirmation) {
				Exceptions.sendNotAcceptableException(
					Translator.translate(RESPONSE_MESSAGES.CONFIRM_PASSWORD_AND_PASSWORD_MUST_MATCH, decodedObj['language'])
				)
			}

			const user: User = await this.usersRepository.findOne({
				where: {
					email: decodedObj['email'],
				},
			})

			if (!user) {
				Exceptions.sendNotFoundException(Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, user.language))
			}

			const passwordHash = bcrypt.hashSync(password)
			user.password = passwordHash

			await this.usersRepository.save(user)
			this.forgotPassEmailVerificationDelay.delete(user.id)
			return {
				message: Translator.translate(RESPONSE_MESSAGES.PASSSWORD_RESET_SUCESSFULLY, user.language),
			}
		} catch (error) {
			this.sharedService.sendError(error, 'resetPasswordRequest')
		}
	}

	/**
	 * @description send forgot password link to user provided emial after request verification
	 * @param email email address where user want to get forgot password link
	 * @returns success messgae or exception
	 * @author Zaigham Javed
	 *
	 */
	async forgetPasswordRequest(email: string): Promise<{ message: string }> {
		try {
			const user: User = await this.usersRepository.findOne({
				where: {
					email: email,
				},
			})
			if (!user) {
				Exceptions.sendNotFoundException(
					Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, process.env.DEFAULT_LANGUAGE)
				)
			}

			if (!user.email_verified_at) {
				Exceptions.sendUnprocessableEntityException(
					Translator.translate(RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED, user.language)
				)
			}

			if (this.forgotPassEmailVerificationDelay.has(user.id)) {
				const timeDiff: number = await dateDiffInMins(
					this.forgotPassEmailVerificationDelay.get(user.id), new Date()
				)
				if (timeDiff < 5) {
					Exceptions.sendForbiddenException(
						Translator.translate(RESPONSE_MESSAGES.WAIT_TO_RESEND_AGAIN, user.language)
					)
				}
			}
			const token = jwt.sign(
				{
					email: user.email,
					language: user.language,
					name: user.first_name,
					resetPassword: true,
				},
				process.env.JWT_TOKEN,
				{
					expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME,
				}
			)
			const resetPasswordUrl: string =
				user.type === USER_TYPE.ADMIN
					? `${process.env.ADMIN_RESET_PASSWORD_PAGE}?token=${token}`
					: `${process.env.USER_RESET_PASSWORD_PAGE}?token=${token}`
			const isEmailSent: boolean = await Mailer.resetPasswordEmail(email, resetPasswordUrl)
			if (!isEmailSent) {
				Exceptions.sendBadRequestException(
					Translator.translate(RESPONSE_MESSAGES.EMAIL_COULD_NOT_BE_SENT, user.language)
				)
			}
			this.forgotPassEmailVerificationDelay.set(user.id, new Date())
			return {
				message: Translator.translate(RESPONSE_MESSAGES.VERIFICATION_EMAIL_SENT, user.language),
			}
		} catch (error) {
			this.sharedService.sendError(error, 'forgetPasswordRequest')
		}
	}

	/**
	 * @description user can change his/her password
	 * @param oldPassword user's current password
	 * @param password new password
	 * @param password_confirmation new password confirmation
	 * @param user user
	 * @returns a success messgae if all the things good else throw exception
	 * @author Zaigham Javed
	 */
	async changePasswordRequest(changePasswordObj: ChangePasswordDTO, user: User): Promise<{ message: string }> {
		try {
			if (changePasswordObj.password !== changePasswordObj.password_confirmation) {
				Exceptions.sendNotAcceptableException(
					Translator.translate(RESPONSE_MESSAGES.CONFIRM_PASSWORD_AND_PASSWORD_MUST_MATCH, user.language)
				)
			}

			if (changePasswordObj.password === changePasswordObj.oldPassword) {
				Exceptions.sendNotAcceptableException(Translator.translate(RESPONSE_MESSAGES.PASSWORD_SAME, user.language))
			}

			const userOnDb: User = await this.usersRepository.findOne({
				where: {
					email: user.email,
				},
			})

			if (!userOnDb) {
				Exceptions.sendNotFoundException(Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, user.language))
			}

			if (!bcrypt.compareSync(changePasswordObj.oldPassword, userOnDb.password)) {
				Exceptions.sendNotAcceptableException(Translator.translate(RESPONSE_MESSAGES.INVALID_PASSWORD, user.language))
			}
			const passwordHash = bcrypt.hashSync(changePasswordObj.password)
			userOnDb.password = passwordHash

			await this.usersRepository.save(userOnDb)

			return {
				message: Translator.translate(RESPONSE_MESSAGES.PASSWORD_CHANGED_SUCESSFULLY, user.language),
			}
		} catch (error) {
			this.sharedService.sendError(error, 'changePasswordRequest')
		}
	}
}
