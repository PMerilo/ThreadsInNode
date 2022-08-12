const { info } = require("flash-messenger/Alert")
const nodemailer = require("nodemailer")
const nodemailerHbs = require("nodemailer-express-handlebars")
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
const { type } = require("os")
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
// class Mail {
//     static send(res, {to, subject, text, template, context,html} = {}) {
//         const mailData = {
//             from: "threadsintimes@gmail.com",
//             to: to,
//             subject: subject,
//             text: text,
//             template: template,
//             context: context,
//             html:html,
            
//         }

//     transporter.sendMail(mailData, (error, info) => {
//         if (error) {
//             return console.log(error)
//         }
//         res.status(200).send({message: "Mail sent", message_id: info.messageId})
//     })
 
//     }
// }

class mail {
    static readHTMLFile(path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                callback(err);
                throw err;
            } else {
                callback(null, html);
            }
        });
    }

    static Send({ subject, email_recipient, template_path, context,filename,Path } = {}) {
        const file = fs.readFile(
            path.join(__dirname, template_path),
            { encoding: 'utf-8' },
            (err, html) => {
                if (err) {
                    console.log(err);
                } else {
                    const template = handlebars.compile(html);
                    const contexts = template(context);
                    const mailOptions = {
                        from: 'threadsintimes@gmail.com',
                        to: email_recipient,
                        subject,
                        html: contexts,
                        attachments: [
                            {   // utf-8 string as an attachment
                                filename: filename,
                                path: Path,
                                contentType: 'image/png', 
                                contentDisposition: 'attachment',
                                encoding: 'base64',
                                


                            }
                            
                        ]
                    };

                    transporter.sendMail(mailOptions, (error, response) => {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
            }
        );
    }
}

module.exports = mail