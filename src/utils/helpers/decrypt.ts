import * as crypto from 'crypto'
export const decrypt = async (data: any, decryptionKey: string) => {
	try {
		const buffer = Buffer.from(data, 'base64')
		const encrypted = crypto.privateDecrypt(
			{ key: decryptionKey, passphrase: process.env.ENCRYPTION_DECRYPTION_KEY },
			buffer
		)
		return encrypted.toString('utf8')
	} catch (err) {
		console.log(err)
		return false
	}
}
