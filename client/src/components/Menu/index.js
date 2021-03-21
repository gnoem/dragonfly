import "./Menu.css";
import { useState, useEffect } from "react";
import { Nav } from "../Nav";

export const Menu = (props) => {
    const [showingMenu, setShowingMenu] = useState(false);
    return (
        <div className="Menu" data-expanded={showingMenu}>
            <button className="menuButton" onClick={() => setShowingMenu(true)}></button>
            {showingMenu && <MainMenu exitMenu={() => setShowingMenu(false)} {...props} />}
        </div>
    );
}

const MainMenu = (props) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const gracefullyCloseMenu = () => {
        setIsMounted(false);
        setTimeout(() => props.exitMenu(), 100);
    }
    return (
        <div className={`MainMenu${isMounted ? '' : ' mounting'}`}>
            <button className="stealth exit" onClick={gracefullyCloseMenu}></button>
            <Nav {...props} exitMenu={gracefullyCloseMenu} />
        </div>
    );
}