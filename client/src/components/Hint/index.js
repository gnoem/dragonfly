export const Hint = ({ children, className }) => {
    const hintClassName = className ? `Hint ${className}` : `Hint`;
    return (
        <div className={hintClassName}>
            {children}
        </div>
    );
}