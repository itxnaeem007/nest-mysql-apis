import * as crypto from 'crypto'
export const encrypt = async (data: any, encryptionKey: string) => {
	try {
		const buffer = Buffer.from(data)
		const encrypted = crypto.publicEncrypt(encryptionKey, buffer)
		return encrypted.toString('base64')
	} catch (err) {
		console.log(err)
		return false
	}
}
