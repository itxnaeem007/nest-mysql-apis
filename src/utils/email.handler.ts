// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as nodemailer from 'nodemailer'
import { verifyEmailTemplate, resetPasswordTemplate } from './email'

export class EmailHandler {
	config() {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			host: 'smtp.gmail.com',
			secureConnection: true,
			auth: {
				user: process.env.SMTP_GMAIL_EMAIL, // generated ethereal user
				pass: process.env.SMTP_GMAIL_PASSWORD, // generated ethereal password
			},
		})

		return transporter
	}

	async verificationEmail(toEmailAddress: string, name: string, userToken: string) {
		const subject = 'Verify Your email'
		const transporter = this.config()

		const verifyEmailUrl = `${process.env.FRONTEND_BASE_URL}//user-verification?token=${userToken}`
		const htmlBody = verifyEmailTemplate(name, verifyEmailUrl)

		const mailOptions = {
			from: process.env.SMTP_GMAIL_EMAIL,
			to: toEmailAddress,
			subject,
			html: htmlBody,
		}

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error)
			} else {
				console.log('Email sent: ' + info.response)
			}
		})
	} // end of email register

	async resetPasswordEmail(toEmailAddress: string, name: string, userToken: string): Promise<boolean> {
		const subject = 'Reset your password'
		const resetPasswordUrl = `${process.env.FRONTEND_BASE_URL}/password/reset?token=${userToken}`
		const htmlBody = resetPasswordTemplate(name, resetPasswordUrl)
		const transporter = this.config()
		const mailOptions = {
			from: process.env.SMTP_GMAIL_EMAIL,
			to: toEmailAddress,
			subject,
			html: htmlBody,
		}

		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error)
					reject(false)
				} else {
					console.log('Email sent: ' + info.response)
					resolve(true)
				}
			})
		})
	}
}
