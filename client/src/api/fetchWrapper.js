import { handleError, handleResponse, FetchError } from './handleError';

// frankensteined from these two articles
// https://medium.com/trabe/fetch-api-errors-and-the-principle-of-least-surprise-66bbba3e4cc2
// https://medium.com/to-err-is-aaron/detect-network-failures-when-using-fetch-40a53d56e36

const makeRequest = (method) => (url, body, options = defaultOptions) => {
    return Promise.race([
        fetchRequest(method, url, body, options),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 10000);
        })
    ]).catch(err => {
        if (err.message === 'Timeout') throw new FetchError({ message: 'The connection timed out.' });
        throw err;
    });
}

const fetchRequest = (method, url, body, options) => {
    return fetch(url, { method, body: JSON.stringify(body), ...options })
        .then(handleError)
        .then(handleResponse);
}

export const get = makeRequest('GET');
export const post = makeRequest('POST');
export const put = makeRequest('PUT');
export const del = makeRequest('DELETE');

const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
}