import "./Header.css";

export const Header = ({ onClick }) => {
    return <h1 className={`Header${onClick ? ' button' : ''}`} onClick={onClick}>Dragonfly</h1>;
}