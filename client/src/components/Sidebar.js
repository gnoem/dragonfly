export default function Sidebar() {
    return (
        <div className="Sidebar">
            <h1>Dragonfly</h1>
            <nav>
                <ul>
                    <li><button className="notes">All Notes</button></li>
                    <li><button className="collections">Collections</button></li>
                    <li><button className="tags">Tags</button></li>
                    <li><button className="starred">Starred</button></li>
                    <li><button className="trash">Trash</button></li>
                </ul>
            </nav>
            <nav>
                <ul>
                    <li><button className="user">My Account</button></li>
                    <li><button className="settings">Settings</button></li>
                    <li><button className="help">Help</button></li>
                </ul>
            </nav>
        </div>
    )
}