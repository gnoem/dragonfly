import { Checkbox } from "../Checkbox";
import { Submit } from "../Form";

export const Alert = ({ children, className }) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

export const Error = ({ children }) => {
    return (
        <Alert>
            <h2>Something went wrong</h2>
            {children}
        </Alert>
    );
}

export const customAlertStore = {
    welcome2: (props) => <Welcome2 {...props} />,
    somethingWentWrong: (props) => <SomethingWentWrong {...props} />
}

// in case I end up doing the self destructing account thing
const Welcome2 = ({ closeModal }) => {
    return (
        <Alert>
            <h1>Welcome to Dragonfly!</h1>
            <p>I created this app as a project for my portfolio, so if you're reading this, there's a good chance you're a friend or fellow programmer who is only here to see what I've built, and nothing more.</p>
            <p>For that reason, and to avoid using up my free database storage with a bunch of one-time users, I've set you up with an account that will self-destruct after 24 hours, along with any notes, settings or other data you create in that time.</p>
            <p>If you want to keep your account, feel free to formally register by clicking on the <b>My Account</b> link in the sidebar.</p>
            <div className="buttons">
                <button onClick={closeModal}>Got it</button>
            </div>
        </Alert>
    );
}

const SomethingWentWrong = ({ options, closeModal }) => {
    const { status, message, error, stack, wisdom, attribution } = options;
    const handleCancel = () => {
        closeModal();
        setTimeout(() => window.location.assign('/'), 200);
    }
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
            <Submit value="Send error report" nvm="Close and reload" onCancel={handleCancel} />
        </Error>
    );
}