const nodemailer = require('nodemailer');

class MailSevice {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    } 

    async sendActivationMail(to, link, email) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация Аккаунта Атт24',
            text: '',
            html: `
                <div>
                    <h1>Почта пользователя: ${email}</h1>
                    <h1>Для активации перейдите по ссылке:</h1>
                    <a href="${link}/1"> Подтвердить Права Обычного Пользователя <a/> <br />
                    <a href="${link}/2"> Подтвердить Расширенные Права Пользователя <a/> <br />
                    <a href="${link}/3"> Подтвердить Права Администратора <a/> <br />
                </div>
            `
        })
    }
}

module.exports = new MailSevice()