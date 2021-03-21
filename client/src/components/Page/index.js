export const Header = ({ onClick }) => {
    return <h1 className={`display${onClick ? ' button' : ''}`} onClick={onClick}>Dragonfly</h1>;
};