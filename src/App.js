import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import UserAlert from './components/UserAlert/UserAlert';
import { connect } from 'react-redux';
import { userLoggedIn } from './redux/reducer';
import './reset.css';
import axios from 'axios';

class App extends Component {
    componentDidMount() {
        axios.get('/auth/currentUser').then(res => {
            if (res.data)
                this.props.userLoggedIn(res.data);
        })
    }
    render() {
        const currentKey = this.props.user.username ? this.props.user.username : 'guest';
        return (
            <div className="App">
                <UserAlert />
                <HashRouter>
                    <Route path="/" render={(props) => {
                        return (
                            <div className="App">
                                <Switch>
                                    <Route path="/" exact component={Landing} />
                                    <Route path="/dashboard" render={(props) =>
                                        <Dashboard
                                            {...props}
                                            key={currentKey}
                                        />}
                                    />
                                </Switch>
                            </div>
                        )
                    }} />
                </HashRouter>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let { user, isAuthenticated } = state;
    return {
        user,
        isAuthenticated
    }
}

export default connect(mapStateToProps, { userLoggedIn })(App);
