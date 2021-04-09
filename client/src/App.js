import "./App.css";
import { useContext } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { ModalContext } from "./contexts";
import { Modal } from "./components/Modal";
import { Home } from "./components/Home";
import { Gateway } from "./components/Gateway";
import { AccountRecovery } from "./components/AccountRecovery";
import { ValidateUser } from "./components/Login";

export const App = () => {
    const { modal, createModal, closeModal } = useContext(ModalContext);
    return (
        <div className="App">
            {modal && <Modal {...modal} />}
            <Router>
                <Switch>
                    <Route path="/recover/:token">
                        <AccountRecovery {...{ createModal }} />
                    </Route>
                    <Route path="/d/:identifier">
                        <Gateway {...{ createModal, closeModal }} />
                    </Route>
                    <Route path="/login">
                        <ValidateUser {...{ createModal }} />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}