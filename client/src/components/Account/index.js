import { EditAccount, CreateAccount } from './forms.js';
import { Header } from '../Page';

export const Account = (props) => {
    const { user } = props;
    return (
        <div className="Account">
            <Header />
            {user ? <EditAccount {...props} /> : <CreateAccount {...props} />}
        </div>
    );
}