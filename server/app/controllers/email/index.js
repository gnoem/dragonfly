import * as path from "path";
import { promises as fs } from "fs";
import handlebars from "handlebars";
import sgMail from "@sendgrid/mail";
import { handle } from "../utils.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const __dirname = path.resolve(path.dirname(''));

const readHTMLFile = (path) => {
    return fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
        if (err) throw err;
        return html;
    });
}

export const sendPasswordResetEmail = async ({ to, subject, resetLink }) => {
    const buildPath = (process.env.NODE_ENV === 'production')
        ? '../client/public/email'
        : 'client/public/email';
    const html = await readHTMLFile(path.resolve(__dirname, buildPath, 'passwordReset.html'));
    const template = handlebars.compile(html);
    const replacements = {
        email: to,
        resetLink
    };
    const htmlToSend = template(replacements);
    const [_, sendMessageError] = await handle(sgMail.send({
        from: `"Dragonfly" <contact@ngw.dev>`,
        to,
        subject, // todo add plaintext option
        html: htmlToSend
    }));
    if (sendMessageError) throw new Error(sendMessageError);
    return `Sent password recovery email to ${to}`;
}