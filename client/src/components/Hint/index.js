export const Hint = ({ children, className }) => {
    return (
        <div className={`Hint ${className ?? ''}`}>
            {children}
        </div>
    );
}