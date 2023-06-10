/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { User } from '../../../entities/users.entity'
import { RESPONSE_MESSAGES } from '../../../utils/enums/response.messages'
import { Translator } from '../../../utils/helpers/translator'
import { USER_TYPE } from '../../../utils/enums/user.type'
import { Exceptions } from '../../../utils/exceptions/exceptions'
import { SharedService } from './../../../components/shared/services/shared.service'
@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly sharedService: SharedService
	) { }

	/**
	 * @description user listing only for admin
	 * @param user user( admin)
	 * @param pageNumber page number
	 * @param pageSize page size
	 * @author Zaigham Javed
	 */
	async getAllUsers(
		pageNumber: number,
		pageSize: number,
		isBlocked?: boolean
	): Promise<{ total: number; users: User[] }> {
		try {
			let filterList = []
			if (isBlocked || isBlocked === false) {
				filterList.push(isBlocked)
			} else {
				filterList = [true, false]
			}

			let users: User[] = await this.usersRepository.find({
				select: ['email', 'created_at', 'first_name', 'last_name', 'is_blocked'],
				where: {
					type: USER_TYPE.USER,
					is_blocked: In(filterList),
				},
			})

			const total: number = users.length

			users = users.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)

			return { total: total, users: users }
		} catch (error) {
			this.sharedService.sendError(error, 'getAllUsers')
		}
	}

	/**
	 * @description block and unblock user toggle
	 * @param user
	 * @author Zaigham Javed
	 */
	async blockUnBlockUserToggle(email: string): Promise<{ message: any }> {
		try {
			const user: User = await this.usersRepository.findOne({
				email: email,
			})
			if (!user) {
				Exceptions.sendNotFoundException(
					Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, process.env.DEFAULT_LANGUAGE)
				)
			}
			user.is_blocked = user.is_blocked ? false : true
			await this.usersRepository.update({ id: user.id }, { is_blocked: user.is_blocked })
			if (user.is_blocked) {
				return {
					message: Translator.translate(RESPONSE_MESSAGES.USER_HAS_BEEN_BLOCKED, user.language),
				}
			}

			return {
				message: Translator.translate(RESPONSE_MESSAGES.USER_HAS_BEEN_UNBLOCKED, user.language),
			}
		} catch (error) {
			this.sharedService.sendError(error, 'blockUnBlockUserToggle')
		}
	}

	/**
	 * @description search user by email or email substring
	 * @param email Optional, user email or sub string of email
	 * @param pageNumber page number
	 * @param pageSize  page size
	 * @param isBlocked optional param filter the blocked an active users
	 * @author Zaigham Javed
	 */
	async searchUsersByemail(
		pageNumber: number,
		pageSize: number,
		email?: string,
		isBlocked?: boolean
	): Promise<{ total: number; users: User[] }> {
		try {
			let filterList = []
			if (isBlocked || isBlocked === false) {
				filterList.push(isBlocked)
			} else {
				filterList = [true, false]
			}

			if (!email) {
				email = '@'
			}
			console.log('going to post')
			let users: User[] = await this.usersRepository
				.createQueryBuilder('user')
				.select([
					'user.email',
					'user.created_at',
					'user.created_at',
					'user.first_name',
					'user.last_name',
					'user.is_blocked',
				])
				.where('email like :email', { email: `%${email}%` })
				.andWhere('type =:type', { type: USER_TYPE.USER })
				.andWhere('is_blocked IN (:...filterList)', { filterList: filterList })
				.orWhere('first_name like :email', { email: `%${email}%` })
				.orWhere('last_name like :email', { email: `%${email}%` })
				.getMany()

			const total: number = users.length
			console.log('total: ', total)
			users = users.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)

			return { total: total, users: users }
		} catch (error) {
			this.sharedService.sendError(error, 'searchUsersByemail')
		}
	}

	/**
	 *
	 * @param user user in db
	 * @param name
	 * @author Zaigham Javed
	 */
	async profile(user: User, firstName?: string, lastName?: string): Promise<boolean> {
		try {
			if (!user) {
				Exceptions.sendNotFoundException(
					Translator.translate(RESPONSE_MESSAGES.USER_NOT_FOUND, process.env.DEFAULT_LANGUAGE)
				)
			}
			await this.usersRepository.update({ id: user.id }, { first_name: firstName, last_name: lastName })
			return true
		} catch (error) {
			this.sharedService.sendError(error, 'profile')
		}
	}

	/**
	 * @description get user updated profile
	 * @param user user in db
	 * @param name
	 * @author Zaigham Javed
	 */
	async getProfile(user: User): Promise<{ first_name: string; last_name: string; email: string }> {
		try {
			const userInDb: User = await this.usersRepository.findOne({
				select: ['first_name', 'last_name', 'email'],
				where: {
					id: user.id,
				},
			})

			return {
				...userInDb,
			}
		} catch (error) {
			await this.sharedService.sendError(error, 'getProfile')
		}
	}
}
