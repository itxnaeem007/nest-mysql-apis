// import * as fs from 'fs'
import * as fs from 'fs'
import { RESPONSE_MESSAGES } from '../enums/response.messages'
export class Translator {
	// static avaliableLanguages: any = process.env.SUPPORTED_LANGUAGES;
	static translate(message: RESPONSE_MESSAGES, language: string) {
		let responseMessages, data
		// check if language is avlaible for translation
		// const found = Translator.avaliableLanguages.find(function (lang) {
		// 	return lang == language
		// })
		// If language is available read file and load translations form respective json file
		// if (found) {
		language = process.env.DEFAULT_LANGUAGE
		try {
			data = fs.readFileSync('src\\utils\\response-messages\\' + language + '.json')
			responseMessages = JSON.parse(data)
			// If there is translation avaliable against message send the translated message
			if (responseMessages[message]) {
				return responseMessages[message]
			} else {
				return message.toString()
			}
		} catch (err) {
			// if error occoured return same message i.e in en_US language
			return message.toString()
		}
		// } else {
		// 	// send the same message i.e in en_US language
		// 	return message.toString()
		// }
	}
}
