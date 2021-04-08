import "./MyAccount.css";
import { EditAccount, CreateAccount, EditPassword } from "./forms.js";
import { Page } from "../Page";

export const MyAccount = ({ user, refreshData }) => {
    return (
        <Page className="MyAccount">
            {user.username ? <EditAccount {...{ user, refreshData }} /> : <CreateAccount {...{ user, refreshData }} />}
        </Page>
    );
}

export { EditPassword }