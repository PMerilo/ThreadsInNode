const { info } = require("flash-messenger/Alert")
const nodemailer = require("nodemailer")
const nodemailerHbs = require("nodemailer-express-handlebars")
const fs = require("fs")
const path = require("path")

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: "threadsintimes@gmail.com",
        pass: "tfnbyrdncejywxso"
    },
    secure: true
})

transporter.use("compile", nodemailerHbs({
    viewPath: path.join(__dirname, ""),
    extName: ".handlebars",
    defaultLayout: false
}))


//"ebioweqbivouqfww" is the user password
class Mail {
    static send(res, {to, subject, text, template, context,html} = {}) {
        const mailData = {
            from: "threadsintimes@gmail.com",
            to: to,
            subject: subject,
            text: text,
            template: template,
            context: context,
            html:html,
            
        }

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error)
        }
        res.status(200).send({message: "Mail sent", message_id: info.messageId})
    })
 
    }
}

module.exports = Mail