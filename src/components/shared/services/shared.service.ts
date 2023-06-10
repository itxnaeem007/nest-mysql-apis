import { Injectable } from '@nestjs/common'
import { I18nRequestScopeService, I18nService } from 'nestjs-i18n'
import { Exceptions } from '../../../utils/exceptions/exceptions'

@Injectable()
export class SharedService {
	constructor(
        private readonly i18n: I18nRequestScopeService
    ) { }

     async sendError(error: any, functionName: string, ){
        console.log(`error in ${functionName}`, error)
        if (!error.response) {            
            Exceptions.sendInternalServerErrorException(
                await this.i18n.translate('response_messages.SERVER_TEMPORY_DOWN')
            )
        }
			throw error
    }


}
