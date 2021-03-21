import "./Sidebar.css";
import { Nav } from "../Nav";
import { Menu } from "../Menu";

export const Sidebar = (props) => {
    const { view, isMobile } = props;
    if (isMobile) return (view.type !== 'note') && <Menu {...props} />;
    return (
        <div className="Sidebar">
            <Nav {...props} />
        </div>
    );
}