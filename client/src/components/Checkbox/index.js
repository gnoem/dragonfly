import "./Checkbox.css";
import { useState } from "react";

export const Checkbox = ({ name, label, checkboxFirst, defaultChecked }) => {
    const [checked, setChecked] = useState(defaultChecked);
    const toggleCheck = () => setChecked(check => !check);
    return (
        <div className={`Checkbox${checkboxFirst ? ' first' : ''}`}>
            <div className="checkboxElement">
            <input type="checkbox" name={name} checked={checked} onChange={toggleCheck} />
                <span className="svg">
                    <svg viewBox="0 0 12 9"><polyline points="1 5 4 8 11 1"></polyline></svg>
                </span>
            </div>
            <label htmlFor={name}>{label}</label>
        </div>
    );
}