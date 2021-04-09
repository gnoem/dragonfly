import "./Sidebar.css";
import { useContext } from "react";
import { ViewContext } from "../../contexts";
import { Nav } from "../Nav";
import { MobileNav } from "../MobileNav";

export const Sidebar = ({ mobileLayout }) => {
    const { view, updateView } = useContext(ViewContext);
    if (mobileLayout === 'mobile') return !view.currentNote && <MobileNav {...{ updateView }} />;
    return (
        <div className="Sidebar">
            <Nav {...{ updateView }} />
        </div>
    );
}