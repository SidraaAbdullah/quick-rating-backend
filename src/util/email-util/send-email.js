const appRoot = require('app-root-path');
const config = require('config');
const sgMail = require('@sendgrid/mail');
const logger = require(appRoot + '/src/logger').apiLogger;
const SENDGRID_API_KEY = config.get('sendGrid.apiKey');
sgMail.setApiKey(SENDGRID_API_KEY);

module.exports = {
  send: async function (params) {
    try {
      logger.info(`starting utilMethod [send]`);
      const emailFromName = params.name;
      const emailFrom = params.from;
      const emailTo = params.to;
      const subject = params.subject;
      const emailContent = params.html;
      //sending email
      const msg = {
        to: emailTo,
        from: {
          email: emailFrom,
          name: emailFromName,
        },
        subject: subject,
        html: emailContent,
        templateId: params.templateId,
        dynamic_template_data: params.placeholders,
      };
      logger.info(`calling SendGrid API to send email to ${emailTo} From ${emailFrom}`);
      await sgMail.send(msg);
      logger.info(` email sent successfully to: ${emailTo} From: ${emailFrom}`);
      return true;
    } catch (error) {
      logger.error(JSON.stringify((error = error.stack)));
      return false;
    }
  },
};
