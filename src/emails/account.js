const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'ronson898@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodByeEmail = (email, name) =>{
    sgMail.send({
        to:email,
        from: 'ronson898@gmail.com',
        subject: 'Good bye from task manager',
        text: `Sorry to see you leaving ${name}. Can you please let us know whether we could have done something to keep you onboard?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}