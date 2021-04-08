import "./Guest.css";
import { Header } from "../Page";

export const Guest = ({ children, className }) => {
    return (
        <div className="Guest">
            <Header onClick={() => window.location.assign('/')} />
            <div className={className}>
                {children}
            </div>
        </div>
    );
}