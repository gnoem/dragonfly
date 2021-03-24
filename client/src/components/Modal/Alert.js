import { Submit } from "../Form";

export const Error = ({ children }) => {
    return (
        <div>
            <h2>Something went wrong</h2>
            {children}
        </div>
    );
}

export const customErrorStore = {
    somethingWentWrong: (props) => <SomethingWentWrong {...props} />
}

const SomethingWentWrong = ({ options }) => {
    const { status, message, error, stack, wisdom, attribution } = options;
    return (
        <Error>
            <blockquote>
                <p className="wisdom">{wisdom}</p>
                <span className="attribution">{attribution}</span>
            </blockquote>
            <p>The server responded with <code>Error {status}: {message}</code>. Please help me improve this app by submitting an error report!</p>
            {(error || stack) &&
                <details>
                    <summary>View details</summary>
                    <div className="errorDetails">
                        {error && <code>{JSON.stringify(error)}</code>}
                        {stack && <code className="greyed">[stack]</code>}
                        {stack && <code>{JSON.stringify(stack)}</code>}
                    </div>
                </details>}
            <Submit value="Send error report" nvm="Close and reload" />
        </Error>
    );
}