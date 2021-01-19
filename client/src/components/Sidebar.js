import Nav from './Nav';

export default function Sidebar(props) {
    return (
        <div className="Sidebar">
            <h1>Dragonfly</h1>
            <Nav {...props} />
        </div>
    );
}