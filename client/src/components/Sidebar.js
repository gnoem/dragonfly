export default function Sidebar(props) {
    const logout = async () => {
        const response = await fetch('/logout/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        window.location.href = `/d/${props.user.username}`;
    }
    return (
        <div className="Sidebar">
            <h1>Dragonfly</h1>
            <nav>
                <ul>
                    <li><button className="notes" onClick={() => props.updateView('all-account')}>All Notes</button></li>
                    <li><button className="collections">Collections</button></li>
                    <li><button className="tags">Tags</button></li>
                    <li><button className="starred">Starred</button></li>
                    <li><button className="trash">Trash</button></li>
                </ul>
            </nav>
            <nav>
                <ul>
                    <li><button className="user" onClick={() => props.updateView('my-account')}>My Account</button></li>
                    <li><button className="settings">Settings</button></li>
                    <li><button className="help">Help</button></li>
                    {props.user.username && <li><button className="logout" onClick={logout}>Log Out</button></li>}
                </ul>
            </nav>
        </div>
    )
}