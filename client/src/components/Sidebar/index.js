import "./Sidebar.css";
import { useContext } from "react";
import { ViewContext } from "../../contexts";
import { Nav } from "../Nav";
import { Menu } from "../Menu";

export const Sidebar = ({ isMobile }) => {
    const { view, updateView } = useContext(ViewContext);
    if (isMobile) return (view.type !== 'note') && <Menu {...{ updateView }} />;
    return (
        <div className="Sidebar">
            <Nav {...{ updateView }} />
        </div>
    );
}