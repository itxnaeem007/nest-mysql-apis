import { User } from '../../entities/users.entity'
import { encrypt } from './encrypt'

export const encryptData = async (data: unknown, user: User) => {
	if (process.env.ENCRYPTION_ENABLED === 'true') {
		return await encrypt(JSON.stringify(data) as string, user.encryption_public_key)
	}

	return data
}
