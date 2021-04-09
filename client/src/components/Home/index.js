import "./Home.css";
import { User } from "../../api";
import { Button } from "../Form";
import { Header } from "../Page";

export const Home = () => {
    const onSuccess = ({ user }) => window.location.assign(`/d/${user._id}`);
    const createUser = () => User.createUser().then(onSuccess);
    return (
        <div className="Home">
            <Header />
            <p>A simple note-taking app for your browser.</p>
            <div className="buttons">
                <Button className="createAccount" type="button" onClick={createUser} showLoadingIcon={true}>Create an account</Button>
                <Button className="logIn" type="button" onClick={() => window.location.assign('/login')}>Log in</Button>
            </div>
        </div>
    );
}