import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { InsertResult, Repository } from 'typeorm'
import { User } from '../../../entities/users.entity'
import * as bcrypt from 'bcryptjs'
import * as speakeasy from 'speakeasy'
import { UserVerificationService } from './users.verification.service'
import { SignupDTO } from '../dtos/signup.dto'
import { LoginDTO } from '../dtos/login.dto'
import { USER_TYPE } from '../../../utils/enums/user.type'
import { Exceptions } from '../../../utils/exceptions/exceptions'
import { createJwtToken } from '../../../utils/helpers/make.jwt.token'
import { generateKeys } from '../../../utils/helpers/generate.encryption.keys'
import { generateMnemonic } from 'bip39'
import { createCipheriv } from 'crypto'
import { SharedService } from './../../../components/shared/services/shared.service'
import * as response_messages from './../../../i18n/en/response_messages.json'
import { I18nRequestScopeService } from 'nestjs-i18n'

@Injectable()
export class UserEntryService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly userVerificationService: UserVerificationService,
		private readonly sharedService: SharedService,
        private readonly i18n: I18nRequestScopeService,
	) { }

	/**
	 * @param signupObj contail user signup info
	 * @param description registration method for both admin and user type.
	 * @author Zaigham Javed
	 */
	async registerRequest(signupObj: SignupDTO): Promise<{ message: string }> {
		try {
			const user = await this.usersRepository.findOne({
				where: {
					email: signupObj.email,
				},
			})
			if (user) {
				Exceptions.sendForbiddenException(await this.i18n.translate('ALREADY_EXISTS'))
			}

			if (signupObj.password !== signupObj.password_confirmation) {
				Exceptions.sendNotAcceptableException(
					await this.i18n.translate('CONFIRM_PASSWORD_AND_PASSWORD_MUST_MATCH')
				)
			}

			// verify if singup request for admin is authorized
			if (signupObj.type === USER_TYPE.ADMIN && signupObj.admin_secret !== process.env.ADMIN_GENERATION_SECRET_KEY) {
				Exceptions.sendNotAcceptableException(
					await this.i18n.translate('MISSING_ADMIN_GENERATION_KEY')
				)
			}

			const userObjToSave = Object.assign({}, signupObj)
			userObjToSave.password = bcrypt.hashSync(signupObj.password)

			userObjToSave['secretCode'] = speakeasy.generateSecret({
				name: `${process.env.TWO_FA_SECRET_CODE}(${signupObj.email})`,
			})
			if (signupObj.type === USER_TYPE.ADMIN) {
				userObjToSave['email_verified_at'] = new Date()
			}
			const userToRegister: User = new User(userObjToSave)
			const insertedResult: InsertResult = await this.usersRepository.insert(userToRegister)

			if (userObjToSave.type === USER_TYPE.USER) {
				const isEmailSent: boolean = await this.userVerificationService.verifyEmailRequest(userToRegister)
				if (!isEmailSent) {
					return {
						message: await this.i18n.translate('USER_REGISTERED_SUCESSFULLY_BUT_EMAIL_COULDNOT_BE_SENT')
					}
				}
			}
			console.log(`User ${userObjToSave.email} successfully registered`)
			this.userVerificationService.resendEmailVerificationDelay.set(insertedResult.generatedMaps[0].id, new Date())
			return {
				message: await this.i18n.translate('SUCCESSFULLY_REGISTERED')
			}
		} catch (error) {
			await this.sharedService.sendError(error, 'registerRequest')
		}
	} // end of registerRequest

	/**
	 * 
	 * @description login method
	 * @param loginObj 
	 * @param ipAddress
	 * @author Zaigham Javed 
	 */
	async loginRequest(loginObj: LoginDTO, ipAddress: string) {
		try {
			const user: User = await this.usersRepository.findOne({
				where: {
					email: loginObj.email,
				},
			})
			if (!user) {
				Exceptions.sendNotFoundException(
					await this.i18n.translate('USER_NOT_FOUND')
				)
			}
			console.log('Token Time', process.env.JWT_TOKEN_EXPIRY_TIME)
			// Password match
			if (bcrypt.compareSync(loginObj.password, user.password)) {
				if (!user.email_verified_at) {
					Exceptions.sendUnauthorizedException(
						await this.i18n.translate('EMAIL_NOT_VERIFIED')
					)
				}
				const token = createJwtToken(user)
				let keys = undefined
				if (process.env.ENCRYPTION_ENABLED === 'true') {
					if (!loginObj.encryption_public_key) {
						Exceptions.sendNotAcceptableException(
							await this.i18n.translate('ENCRYPTION_PUBLIC_KEY_SHOULD_NOT_BE_EMAPTY')
						)
					}
					keys = await generateKeys()
					user.decryption_private_key = keys['privateKey']
					user.encryption_public_key = loginObj.encryption_public_key
				}
				user.jwt_token = token
				// TODO: manage ip address and other details in a separate logging table
				user.ip_address = ipAddress
				let phrase: string = undefined
				if (user.type === USER_TYPE.USER && !user.phrase_hash) {
					// creating 12 words seed to resotre wallet
					phrase = generateMnemonic()
					console.log('restorePhrases: ', phrase)
					const hashedPhrase = await this.encryptPhrase(phrase)
					user.phrase_hash = hashedPhrase
				}
				await this.usersRepository.save(user)
				console.log('user in login: ', user)
				console.log('user ip address: ', user.ip_address)
				if (user.is_2fa_enabled) {
					return this.loginResponse(
						response_messages.NEED_TWO_FA_CODE,
						user,
						token,
						phrase,
						keys ? keys['publicKey'] : undefined
					)
				}
				return this.loginResponse(
					response_messages.SUCCESSFULLY_LOGIN,
					user,
					token,
					phrase,
					keys ? keys['publicKey'] : undefined
				)
			} else {
				Exceptions.sendUnauthorizedException(await this.i18n.translate('INVALID_PASSWORD'))
			}
		} catch (error) {
			await this.sharedService.sendError(error, 'loginRequest')
		}
	}

	/**
	 *
	 * @param message message
	 * @param user user
	 * @param token token
	 * @param encryptionPublicKey encryotion key
	 * @author Zaigham Javed
	 */
	private async loginResponse(
		message: string,
		user: User,
		token: string,
		phrase: string,
		encryptionPublicKey?: string
	) {
		console.log(encryptionPublicKey)
		return {
			message: await this.i18n.translate(message),
			user: {
				token: token,
				name: user.first_name,
				email: user.email,
				type: user.type,
				is_2fa_enabled: user.is_2fa_enabled,
				phrase: phrase ? phrase : undefined,
				encryption_public_key: encryptionPublicKey ? encryptionPublicKey : undefined,
			},
		}
	}

	/**
	 * @description encrypt the data
	 * @param data 12 words phrase
	 * @author Zaigham Javed
	 */
	async encryptPhrase(data: string) {
		try {
			const cipher = createCipheriv('aes-256-ecb', process.env.PHRASE_ENCRYPTION_DECRYPTION_KEY, '')
			return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
		} catch (ex) {
			throw new Error(ex)
		}
	}
}
