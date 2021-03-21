import "./GiantCornerButton.css";

export const GiantCornerButton = ({ className, onClick }) => {
    return <button className={`GiantCornerButton ${className ?? ''}`} onClick={onClick}></button>
}