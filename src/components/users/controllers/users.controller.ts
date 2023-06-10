import { Controller, Get, Post, Request, Response, Body, UseGuards, Put, Param, HttpStatus, Query } from '@nestjs/common'
import { User } from '../../../entities/users.entity'
import { AuthenticationGuard } from '../../middleware/authentication.guard'
import { User2FADTO } from '../dtos/user2faDTO'
import { UsersAccountService } from '../services/users.account.service'
import { LoginDTO } from '../dtos/login.dto'
import { SignupDTO } from '../dtos/signup.dto'
import { EmailDTO } from '../dtos/email.dto'
import { ResetPasswordDTO } from '../dtos/reset_password.dto'
import { ChangePasswordDTO } from '../dtos/change_password.dto'
import { UserVerificationService } from '../services/users.verification.service'
import { Verify2FADTO } from '../dtos/verify_2fa.dto'
import { UsersPasswordService } from '../services/users.password.service'
import { UserEntryService } from '../services/user.entry.service'
import { encryptData } from '../../../utils/helpers/encrypt.data'
import { ProfileDTO } from '../dtos/profile.dto'
import { UsersService } from '../services/users.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

@Controller('user')
export class UsersController {
	constructor(
		private readonly userAccountService: UsersAccountService,
		private readonly userVerificationService: UserVerificationService,
		private readonly userPasswordService: UsersPasswordService,
		private readonly userEntryService: UserEntryService,
		private readonly userService: UsersService
	) { }

	@Post('/login')
	@ApiOperation({ summary: 'User Login' })
	@ApiResponse({ status: 200, description: 'Successfull' })
	async loginRequest(@Body() loginObj: LoginDTO, @Response() res, @Request() req) {
		let ipAddress: string = ''
		if (req.headers['x-real-ip']) {
			ipAddress = req.headers['x-real-ip']
		}
		const response = await this.userEntryService.loginRequest(loginObj, ipAddress)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Post('/verification/email/resend')
	async verifyEmailRequest(@Body() emailDto: EmailDTO, @Response() res) {
		const response = await this.userVerificationService.verifyEmailResendRequest(emailDto.email)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Put('/user-verification/:token')
	async verifyEmail(@Param('token') token: string, @Response() res) {
		const response = await this.userVerificationService.verifyEmail(token)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Post('/register')
	async registerRequest(@Body() signupObj: SignupDTO, @Response() res) {
		const response = await this.userEntryService.registerRequest(signupObj)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Post('/forgot/password/request')
	async forgetPasswordRequest(@Body() emailDto: EmailDTO, @Response() res) {
		const response = await this.userPasswordService.forgetPasswordRequest(emailDto.email)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Post('/password/reset/:token')
	async resetPasswordRequest(
		@Param('token') token: string,
		@Body() resetPasswordObj: ResetPasswordDTO,
		@Response() res
	) {
		const response = await this.userPasswordService.resetPasswordRequest(
			resetPasswordObj.password,
			resetPasswordObj.password_confirmation,
			token
		)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Post('/password/change')
	async changePasswordRequest(@Body() changePasswordObj: ChangePasswordDTO, @Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userPasswordService.changePasswordRequest(
			changePasswordObj,
			user
		)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Get('/2fa')
	async get2FADetails(@Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userAccountService.get2FADetails(user)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Post('/2fa')
	async set2FAStatus(@Body() user2faDTO: User2FADTO, @Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userAccountService.set2FAStatus(user2faDTO, user)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Post('/verify/2fa')
	async verify2FA(@Body() verify2faDTO: Verify2FADTO, @Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userAccountService.verify2FA(verify2faDTO.code, user)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Get('/jwt/token')
	async getNewJwtToken(@Request() req, @Response() res) {
		const response = await this.userVerificationService.getNewJwtToken(req)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Post('/profile')
	async profile(@Body() body: ProfileDTO, @Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userService.profile(user, body.name)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response: response,
		})
	}

	@UseGuards(AuthenticationGuard)
	@Get('/profile')
	async getprofile(@Request() req, @Response() res) {
		const user: User = req.user
		let response: unknown = await this.userService.getProfile(user)
		response = await encryptData(response, user)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response,
		})
	}

	@Get('/exist')
	async isUserExist(@Query() emailObj: EmailDTO, @Request() req, @Response() res) {
		const response = await this.userVerificationService.isUserExist(emailObj.email)
		return res.status(HttpStatus.OK).json({
			code: HttpStatus.OK,
			response: response,
		})
	}

}
