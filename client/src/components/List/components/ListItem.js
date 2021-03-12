export const ListItem = ({ title, children, button, className, onClick }) => {
    return (
        <div className={`ListItem${button ? ' grid' : ''} ${className || ''}`} onClick={onClick}>
            {title}
            {children}
            {button}
        </div>
    );
}

export const ListItemTitle = ({ children }) => <h2>{children}</h2>;

export const ListItemContent = ({ children }) => <div>{children}</div>;

export const ListItemButton = ({ children }) => <div className="ListItemButton">{children}</div>;