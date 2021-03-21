import "./Tags.css";
import { useState } from "react";
import { MiniMenu } from "../MiniMenu";

export const TagList = ({ children, className }) => {
    return (
        <div className={`TagList ${className ?? ''}`}>
            {children}
        </div>
    );
}

export const Tag = ({ name, selected, onClick, contextMenu }) => {
    const [show, setShow] = useState(false);
    const contextMenuClick = (e) => {
        if (!contextMenu) return;
        e.preventDefault();
        setShow(true);
    }
    return (
        <div className={`Tag ${selected ? 'selected' : ''}`}>
            <button onClick={onClick} onContextMenu={contextMenuClick}>{name}</button>
            {contextMenu && <MiniMenu show={show} updateShow={setShow} menuItems={contextMenu.menuItems} />}
        </div>
    );
}