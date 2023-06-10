export const verifyEmailTemplate = (name: string, verifyLink: string) => {
	if (!name) {
		name = 'user'
	}
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <style>
            body, td{
                margin: 0;
                font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
            }
            a[href] {
        color: #15c;
    }
        </style>
    </head>


    <body style="margin: 0; padding: 0;">

        <div>
            <table>
                <tbody><tr>
                    <td></td>
                    <td width="600">
                        <div>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tbody><tr>
                                    <td>
                                        <table cellpadding="0" cellspacing="0">
                                            <tbody><tr>
                                            </tr>
                                            <tr>
                                                <td>
                                                  <p>Dear ${name},</p>
            <p>Please click the following link to verify your email.</p>
            <p><a href="${verifyLink}">Verify Email Link</a></p>
                                                </td>
                                            </tr>
                                          </tbody></table>
                                    </td>
                                </tr>
                            </tbody></table>
                          </div>
                        </td>
                </tr>
            </tbody></table><div class="yj6qo"></div><div class="adL">
            </div></div>
    </body>
    </html>
    `
}
