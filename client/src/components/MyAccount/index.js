import "./MyAccount.css";
import { EditAccount, CreateAccount } from "./forms.js";
import { Header } from "../Page";

export const MyAccount = (props) => {
    const { user } = props;
    return (
        <div className="MyAccount">
            <Header />
            {user.username ? <EditAccount {...props} /> : <CreateAccount {...props} />}
        </div>
    );
}