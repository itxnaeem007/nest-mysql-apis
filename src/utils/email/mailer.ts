import * as sgMail from '@sendgrid/mail'
export class Mailer {
	static async resetPasswordEmail(email: string, url: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

		const msg = {
			to: email,
			from: process.env.ADMIN_SUPPORT_EMAIL,
			templateId: 'd-12effea511084a698a2a603fdadc6bf7',
			dynamic_template_data: { url: url },
		}
		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	static async verificatoinEmail(email: string, name: string, url: string): Promise<boolean> {
		sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

		const msg = {
			to: email,
			from: process.env.ADMIN_SUPPORT_EMAIL,
			templateId: 'd-a4c0aac014d540a3b19876872dd708f6',
			dynamic_template_data: { user: name, url: url },
		}
		try {
			await sgMail.send(msg)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}
}
