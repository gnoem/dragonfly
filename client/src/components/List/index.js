export const List = ({ children }) => {
    return (
        <div className="List">
            {children}
        </div>
    );
}

export const ListHeader = ({ title, button, grid, children }) => {
    return (
        <div className={`ListHeader${grid ? ' grid' : ''}`}>
            <h1>Dragonfly</h1>
            <h2>{title}</h2>
            {button}
            {children}
        </div>
    );
}

export const ListContent = ({ footer, children }) => {
    return (
        <div className="ListContent">
            {children}
            {footer}
        </div>
    );
}

export const ListFooter = ({ children }) => {
    return (
        <div className="ListFooter">
            {children}
        </div>
    );
}