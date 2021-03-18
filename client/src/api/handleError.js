export class FetchError extends Error {
    constructor(meta = {}) {
        super('No response from server');
        Object.assign(this, meta);
        this.name = 'FetchError';
    }
}

class ValidationError extends Error {
    constructor(meta = {}) {
        super('Form validation failed');
        Object.assign(this, meta);
        this.name = 'ValidationError';
        this.wisdom = 'Anyone can make mistakes, but only an idiot persists in error';
        this.attribution = 'Marcus Tullius Cicero';
    }
}

class ServerError extends Error {
    constructor({ status, message, error }) {
        super(`Server error ${status}: ${message}`);
        Object.assign(this, { status, message, error });
        this.name = 'ServerError';
        this.wisdom = 'I am indeed amazed when I consider how weak my mind is and how prone to error';
        this.attribution = 'René Descartes';
    }
}

class UnknownError extends Error {
    constructor(meta = {}) {
        super('An unknown error occurred');
        Object.assign(this, meta);
        this.name = 'UnknownError';
    }
}

export const handleError = async (res) => {
    if (res.ok) return res;
    const { message, error } = await handleResponse(res);
    switch (res.status) {
        case 422: throw new ValidationError({ message });
        case 500: throw new ServerError({ status: res.status, message, error });
        default: throw new UnknownError();
    }
}

export const handleResponse = async (res) => {
    if (res.status === 204) return; // 'no content' response, e.g. after deleting a resource
    const body = await res.json();
    return body;
}