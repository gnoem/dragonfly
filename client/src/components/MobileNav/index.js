import "./MobileNav.css";
import { useRef, useState } from "react";
import { Nav } from "../Nav";

export const MobileNav = ({ updateView }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="MobileNav">
            <button className="menuButton" onClick={() => setExpanded(true)}></button>
            {expanded && <NavMenu {...{ updateView, exitMenu: () => setExpanded(false) }} />}
        </div>
    )
}

const NavMenu = ({ updateView, exitMenu }) => {
    const menuRef = useRef(null);
    const handleExit = () => {
        const { current: menu } = menuRef;
        if (!menu) return;
        menu.classList.add('goodbye');
        setTimeout(exitMenu, 200);
    }
    const handleUpdateView = (view) => {
        handleExit();
        updateView(view);
    }
    return (
        <div className="NavMenu" ref={menuRef}>
            <button className="exit" onClick={handleExit}></button>
            <Nav {...{ updateView: handleUpdateView }} />
        </div>
    );
}