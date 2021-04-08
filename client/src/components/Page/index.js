import "./Page.css";
import { GiantCornerButton } from "./GiantCornerButton";
import { Header } from "./Header";

export const Page = ({ children, className }) => {
    return (
        <div className="Page">
            <Header />
            <div className={className}>
                {children}
            </div>
        </div>
    )
}

export { GiantCornerButton, Header }