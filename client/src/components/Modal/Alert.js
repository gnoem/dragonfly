export const Alert = ({ children }) => {
    return (
        <div>{children}</div>
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