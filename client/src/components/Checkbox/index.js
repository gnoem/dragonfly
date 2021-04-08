import "./Checkbox.css";

export const Checkbox = ({ label, detailedLabel, checked, onChange }) => {
    return (
        <div className={`Checkbox${detailedLabel ? ' detailed' : ''}`}>
            <div className="checkboxElement">
                <input type="checkbox" onChange={onChange} checked={checked} />
                <span className="svg">
                    <svg viewBox="0 0 16 16"><polyline points="3 9 6 12 13 5"></polyline></svg>
                </span>
            </div>
            {label
                ? <label>{label}</label>
                : <div className="label">
                    <label>{detailedLabel[0]}</label>
                    <span>{detailedLabel[1]}</span>
                  </div>
            }
        </div>
    );
}