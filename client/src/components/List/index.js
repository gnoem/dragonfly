import "./List.css";
import { Header } from "../Page";

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
            <Header />
            <h2>{title}</h2>
            {button}
            {children}
        </div>
    );
}

export const ListHeaderButton = ({ children }) => {
    return (
        <div className="ListHeaderButton">
            {children}
        </div>
    );
}

export const ListContent = ({ footer, className, children }) => {
    return (
        <div className={`ListContent ${className ?? ''}`}>
            <div className="ListItems">
                {children}
            </div>
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