export const Nav = (props) => {
    return (
        <div className="Nav">
            <NavList>
                <NavItem {...props} name="all-notes">All Notes</NavItem>
                <NavItem {...props} name="starred-notes">Starred</NavItem>
                <NavItem {...props} name="collections">Collections</NavItem>
                <NavItem {...props} name="tags">Tags</NavItem>
                <NavItem {...props} name="trash">Trash</NavItem>
            </NavList>
            <hr />
            <NavList>
                <NavItem {...props} name="my-account">My Account</NavItem>
                <NavItem {...props} name="settings">Settings</NavItem>
                <NavItem {...props} name="help">Help</NavItem>
                <NavItem {...props} name="logout" onClick={props.logout}>Logout</NavItem>
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
        if (onClick) return onClick();
        updateView(() => {
            const obj = { type: name };
            if (name === 'tags') obj.tags = [];
            return obj;
        });
    }
    return (
        <li>
            <button className={name} onClick={handleClick}>{children}</button>
        </li>
    );
}