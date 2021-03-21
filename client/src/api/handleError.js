export class FetchError extends Error {
    constructor(meta = {}) {
        super('No response from server');
        Object.assign(this, meta);
        this.name = 'FetchError';
    }
}

class ClientError extends Error {
    constructor({ status, message }) {
        super(`Client error ${status}: ${message}`);
        Object.assign(this, { status, message });
        this.name = 'ClientError';
    }
}

class ValidationError extends Error {
    constructor(meta = {}) {
        const errorDescription = "Everything's working on our end, but it looks like you entered an invalid form value and you need to change it before you try to resubmit. Well, not EVERYTHING is working on our end because to tell you the truth, you shouldn't even be seeing this message, there's supposed to be like a detailed error report where the bad input field lights up red and then you can hover over the little error alert icon to see what the problem was and how to fix it. (Probably it's just a minimum/maximum character length thing, or maybe you left a required input empty or something like that.) But yeah, you shouldn't be seeing this message and if you are, I would SO appreciate it if you would contact me so I can fix this. Crazy how I can spend hours and hours trying to program my app to handle errors gracefully and deliver meaningful, descriptive error reports and then this shit happens!!"
        // todo write something different lol
        super(errorDescription);
        Object.assign(this, meta);
        this.name = 'ValidationError';
        this.wisdom = 'Anyone can make mistakes, but only an idiot persists in error';
        this.attribution = 'Cicero';
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
    if (res.ok || res.status === 401 || res.status === 307) return res; // 401 = unauthorized, 307 = redirect
    const { message, error } = await handleResponse(res);
    switch (res.status) {
        case 404: throw new ClientError({ status: res.status, message });
        case 422: throw new ValidationError({ error });
        case 500: throw new ServerError({ status: res.status, message, error });
        default: throw new UnknownError();
    }
}

export const handleResponse = async (res) => {
    if (res.status === 204) return; // 'no content' response, e.g. after deleting a resource
    const body = await res.json();
    return body;
}