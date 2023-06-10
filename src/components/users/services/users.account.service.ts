/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../entities/users.entity'
import { User2FADTO } from '../dtos/user2faDTO'
import * as speakeasy from 'speakeasy'
import { RESPONSE_MESSAGES } from '../../../utils/enums/response.messages'
import { Translator } from '../../../utils/helpers/translator'
import * as jwt from 'jsonwebtoken'
import { Exceptions } from '../../../utils/exceptions/exceptions'
import { SharedService } from './../../../components/shared/services/shared.service'


@Injectable()
export class UsersAccountService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly sharedService: SharedService

	) { }

	/**
	 * return 2fa details
	 * @param user user
	 * @author Zaigham Javed
	 */
	async get2FADetails(
		user: User
	): Promise<{ message: string; google_2fa_status: boolean; google_2fa_secret: string; google_2fa_totp: string }> {
		try {
			const userOnDb = await this.usersRepository.findOne({
				where: {
					id: user.id,
				},
				select: ['google_2fa_totp', 'google2fa_secret', 'is_2fa_enabled'],
			})

			console.log(userOnDb)

			if (!userOnDb.google_2fa_totp) {
				userOnDb.google_2fa_totp = `otpauth://totp/${process.env.TWO_FA_SECRET_CODE}(${user.email})?secret=${userOnDb.google2fa_secret}`
			}

			return {
				message: Translator.translate(RESPONSE_MESSAGES.SUCCESS, user.language),
				google_2fa_status: userOnDb.is_2fa_enabled,
				google_2fa_secret: userOnDb.is_2fa_enabled ? '' : userOnDb.google2fa_secret,
				google_2fa_totp: userOnDb.is_2fa_enabled ? '' : userOnDb.google_2fa_totp,
			}
		} catch (error) {
			this.sharedService.sendError(error, 'get2FADetails')

		}
	} // end of get 2FADetails

	/**
	 *
	 * @param user2faDTO
	 * @param user
	 * @author Zaigham Javed
	 */
	async set2FAStatus(user2faDTO: User2FADTO, user: User): Promise<{ message: string; google_2fa_status: boolean }> {
		try {
			let userOnDb = await this.usersRepository.findOne({
				where: {
					id: user.id,
				},
				select: ['id', 'email', 'google_2fa_totp', 'google2fa_secret', 'is_2fa_enabled'],
			})

			console.log(userOnDb)

			const verified = speakeasy.totp.verify({
				secret: userOnDb.google2fa_secret,
				encoding: 'base32',
				token: user2faDTO.google_2fa_code.toString(),
			})

			if (!verified) {
				Exceptions.sendNotAcceptableException(Translator.translate(RESPONSE_MESSAGES.INVALID_2FA, user.language))
			}

			let message = Translator.translate(RESPONSE_MESSAGES.TWO_FA_ENABLED_SUCCESSFULLY, user.language)
			if (userOnDb.is_2fa_enabled === true) {
				message = Translator.translate(RESPONSE_MESSAGES.TWO_FA_DISABLED_SUCCESSFULLY, user.language)
			}

			userOnDb.is_2fa_enabled = userOnDb.is_2fa_enabled === true ? false : true

			userOnDb = await this.usersRepository.save(userOnDb)

			return {
				message: message,
				google_2fa_status: userOnDb.is_2fa_enabled,
			}
		} catch (error) {
			this.sharedService.sendError(error, 'set2FAStatus')

		}
	} // end of function

	/**
	 * @description verify google 2fa code if enabled
	 * @param code two fa code
	 * @param user user
	 * @author Zaigham Javed
	 */
	async verify2FA(code: number, user: User) {
		try {
			// to check google 2FA verification
			const userSecret: string = user.google2fa_secret
			delete user.google2fa_secret

			const verified = speakeasy.totp.verify({
				secret: userSecret,
				encoding: 'base32',
				token: code.toString(),
			})

			if (!verified) {
				Exceptions.sendUnprocessableEntityException(Translator.translate(RESPONSE_MESSAGES.INVALID_2FA, user.language))
			}

			// Creating new Access Token for the API.
			const token = jwt.sign({ ...user, google_2fa_code_verified: true }, process.env.JWT_TOKEN, {
				expiresIn: process.env.JWT_TOKEN_EXPIRY_TIME,
			})

			return {
				message: Translator.translate(RESPONSE_MESSAGES.SUCCESSFULLY_LOGIN, user.language),
				user: {
					token: token,
					name: user.first_name,
					type: user.type,
					is_2fa_enabled: user.is_2fa_enabled,
				},
			}
		} catch (error) {
			this.sharedService.sendError(error, 'verify2FA')
		}
	}
}
