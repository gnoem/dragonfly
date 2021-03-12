import { Nav } from '../Nav';

export default function Sidebar(props) {
    return (
        <div className="Sidebar">
            <Nav {...props} />
        </div>
    );
}