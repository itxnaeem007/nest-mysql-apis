/* tslint:disable-next-line */
const { generateKeyPairSync } = require('crypto')

export const generateKeys = async () => {
	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 1050,
		namedCurve: 'secp256k1',
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem',
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem',
			cipher: 'aes-256-cbc',
			passphrase: process.env.ENCRYPTION_DECRYPTION_KEY,
		},
	})

	return { privateKey, publicKey }
}
