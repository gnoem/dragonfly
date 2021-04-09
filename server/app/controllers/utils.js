import mongoose from 'mongoose';

export const handle = (promise) => {
    return promise.then(data => ([data, undefined])).catch(err => Promise.resolve([undefined, err]));
}

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;

export const FormError = (fieldName, errorMessage) => ({ [fieldName]: errorMessage });

export class ServerError extends Error {
    constructor(status = 500, message = 'Unknown error', error = '') {
        super(`Server error ${status}: ${message}`);
        Object.assign(this, { status, message, error: error.toString() });
        this.name = 'ServerError';
    }
}

export const formErrorReport = (errors) => {
    const report = errors.reduce((obj, error) => {
        if (error.location !== 'body') return null;
        obj[error.param] = error.msg;
        return obj;
    }, {});
    return report;
}