
export class Utility {
	static validateEmail(email) {
			const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			return re.test(String(email).toLowerCase())
	}
	static validatePassword(password) {
		const passRegex = /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
		return passRegex.test(password)
	}
	static ValidatePhoneNo(phone) {
		const p = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{9})$/
		return p.test(phone)
	}
}
