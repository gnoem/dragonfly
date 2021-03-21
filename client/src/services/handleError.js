import { Submit } from "../components/Form";

export const handleError = (err, handlers = {}) => {
    const { handleFormError, updateModal } = handlers;
    if (err.name === 'ValidationError') {
        return handleFormError ? handleFormError(err.error) : updateModal(err.message, 'error');
    }
    return updateModal(detailedMessage(err), 'error');
}

const detailedMessage = ({ status, message, error, stack, wisdom, attribution }) => {
    return (
        <div>
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
        </div>
    );
}