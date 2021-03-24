import "./Menu.css";
import { useState, useEffect } from "react";
import { Nav } from "../Nav";

export const Menu = ({ updateView }) => {
    const [showingMenu, setShowingMenu] = useState(false);
    return (
        <div className="Menu" data-expanded={showingMenu}>
            <button className="menuButton" onClick={() => setShowingMenu(true)}></button>
            {showingMenu && <MainMenu {...{ updateView }} exitMenu={() => setShowingMenu(false)} />}
        </div>
    );
}

const MainMenu = ({ exitMenu, updateView }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const gracefullyCloseMenu = () => {
        setIsMounted(false);
        setTimeout(() => exitMenu(), 100);
    }
    return (
        <div className={`MainMenu${isMounted ? '' : ' mounting'}`}>
            <button className="stealth exit" onClick={gracefullyCloseMenu}></button>
            <Nav {...{ updateView }} exitMenu={gracefullyCloseMenu} />
        </div>
    );
}