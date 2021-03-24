import { useContext } from "react";
import { DataContext } from "contexts";
import "./Nav.css";

export const Nav = ({ updateView }) => {
    const { logout } = useContext(DataContext);
    return (
        <div className="Nav">
            <NavList>
                <NavItem {...{ updateView }} name="all-notes">All Notes</NavItem>
                <NavItem {...{ updateView }} name="starred-notes">Starred</NavItem>
                <NavItem {...{ updateView }} name="collections">Collections</NavItem>
                <NavItem {...{ updateView }} name="tags">Tags</NavItem>
                <NavItem {...{ updateView }} name="trash">Trash</NavItem>
            </NavList>
            <hr />
            <NavList>
                <NavItem {...{ updateView }} name="my-account">My Account</NavItem>
                <NavItem {...{ updateView }} name="settings">Settings</NavItem>
                <NavItem {...{ updateView }} name="help">Help</NavItem>
                <NavItem {...{ updateView }} name="logout" onClick={logout}>Logout</NavItem>
            </NavList>
        </div>
    );
}

const NavList = ({ children }) => {
    return (
        <nav>
            <ul>
                {children}
            </ul>    
        </nav>
    );
}

const NavItem = ({ name, children, updateView, onClick }) => {
    const handleClick = () => {
        updateView(() => {
            const obj = { type: name };
            if (name === 'tags') {
                obj.tags = [];
                obj.sortMethod = 'all';
            }
            return obj;
        });
    }
    return (
        <li>
            <button className={name} onClick={onClick ?? handleClick}>{children}</button>
        </li>
    );
}