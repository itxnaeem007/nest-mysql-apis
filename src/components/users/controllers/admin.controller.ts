import { Controller, Post, Request, Response, Body, UseGuards, HttpStatus } from '@nestjs/common'
import { UsersService } from './../services/users.service'
import { EmailDTO } from './../dtos/email.dto'
import { GetUsersDTO } from './../dtos/get_users.dto'
import { AdminAuthenticationGuard } from '../../middleware/admin.authentication.guard'
import { SearchUserDTO } from './../dtos/search_user_by_email.dto'
import { encryptData } from '../../../utils/helpers/encrypt.data'

@Controller('admin')
export class AdminController {
	constructor(private readonly userService: UsersService) { }

	@UseGuards(AdminAuthenticationGuard)
	@Post('/get/users')
	async getAllUsers(@Body() getUsersDTO: GetUsersDTO, @Request() req, @Response() res) {
		let response: unknown = await this.userService.getAllUsers(
			getUsersDTO.pageNumber,
			getUsersDTO.pageSize,
			getUsersDTO.isBlocked
		)
		if (response === false) {
			return res.status(HttpStatus.EXPECTATION_FAILED).json({
				code: HttpStatus.EXPECTATION_FAILED,
				response,
			})
		}
		response = await encryptData(response, req.user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AdminAuthenticationGuard)
	@Post('/block/toggle')
	async blockUnBlockToggle(@Body() emailDTO: EmailDTO, @Request() req, @Response() res) {
		let response: unknown = await this.userService.blockUnBlockUserToggle(emailDTO.email)
		if (response === false) {
			return res.status(HttpStatus.EXPECTATION_FAILED).json({
				code: HttpStatus.EXPECTATION_FAILED,
				response,
			})
		}
		response = await encryptData(response, req.user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AdminAuthenticationGuard)
	@Post('/search/user')
	async searchUserByEmail(@Body() searchUserDTO: SearchUserDTO, @Request() req, @Response() res) {
		let response: unknown = await this.userService.searchUsersByemail(
			searchUserDTO.pageNumber,
			searchUserDTO.pageSize,
			searchUserDTO.email,
			searchUserDTO.isBlocked
		)
		if (response === false) {
			return res.status(HttpStatus.EXPECTATION_FAILED).json({
				code: HttpStatus.EXPECTATION_FAILED,
				response,
			})
		}
		response = await encryptData(response, req.user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}
}
