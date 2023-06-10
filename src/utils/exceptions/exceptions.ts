import {
	NotAcceptableException,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	UnprocessableEntityException,
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common'
import { Translator } from '../helpers/translator'
import { RESPONSE_MESSAGES } from '../enums/response.messages'

export class Exceptions {
	static sendNotAcceptableException(message: string) {
		throw new NotAcceptableException(message)
	}

	static sendNotFoundException(message: string) {
		throw new NotFoundException(message)
	}

	static sendInternalServerErrorException(message: string) {
		throw new InternalServerErrorException(message)
	}

	static sendConflictException(message: string) {
		throw new ConflictException(message)
	}

	static sendUnprocessableEntityException(message: string) {
		throw new UnprocessableEntityException(message)
	}

	static sendBadRequestException(message: string) {
		throw new BadRequestException(message)
	}

	static sendForbiddenException(message: string) {
		throw new ForbiddenException(message)
	}

	static sendUnauthorizedException(message: string) {
		throw new UnauthorizedException(message)
	}
}
