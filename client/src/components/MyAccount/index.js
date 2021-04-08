import "./MyAccount.css";
import { EditAccount, CreateAccount, EditPassword } from "./forms.js";
import { Header } from "../Page";

export const MyAccount = ({ user, refreshData }) => {
    return (
        <div className="MyAccount">
            <Header />
            {user.username ? <EditAccount {...{ user, refreshData }} /> : <CreateAccount {...{ user, refreshData }} />}
        </div>
    );
}

export { EditPassword }