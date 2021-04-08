import "./App.css";
import { useContext } from "react";
import { ModalContext } from "contexts";
import { Modal } from "components/Modal";
import { Home } from "components/Home";
import { Gateway } from "components/Gateway";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { AccountRecovery } from "components/AccountRecovery";

export const App = () => {
    const { modal, createModal } = useContext(ModalContext);
    return (
        <div className="App">
            {modal && <Modal {...modal} />}
            <Router>
                <Switch>
                    <Route path="/recover/:token">
                        <AccountRecovery {...{ createModal }} />
                    </Route>
                    <Route path="/d/:identifier">
                        <Gateway {...{ createModal }} />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}