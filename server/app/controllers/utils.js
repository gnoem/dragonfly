import mongoose from 'mongoose';

export const handle = (promise) => {
    return promise.then(data => ([data, undefined])).catch(err => Promise.resolve([undefined, err]));
}

export const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;

export const FormError = (fieldName, errorMessage) => ({ [fieldName]: errorMessage });

export const validationError = (errors) => {
    const report = errors.reduce((obj, error) => {
        if (error.location !== 'body') return null;
        obj[error.param] = error.msg;
        return obj;
    }, {});
    return report;
}