import "./App.css";
import { AppContextProvider } from "./contexts";
import { Home } from "./components/Home";
import { Gateway } from "./components/Gateway";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

export default function App() {
    return (
        <AppContextProvider>
            <div className="App">
                <Router>
                    <Switch>
                        <Route path="/d/:id" render={(props) => <Gateway {...props} />} />
                        <Route path="/">
                            <Home />
                        </Route>
                    </Switch>
                </Router>
            </div>
        </AppContextProvider>
    );
}