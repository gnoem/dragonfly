import "./App.css";
import Home from "../Home";
import { Dashboard } from "../Dashboard";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

export default function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/d/:id" render={(props) => <Dashboard {...props} />} />
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}