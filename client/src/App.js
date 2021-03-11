import './App.css';
import Home from './components/Home';
import { Dashboard } from './components/Dashboard/index';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';

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