import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { userLoggedIn, createAlertMessage } from '../../redux/reducer';
import './Landing.css';
import axios from 'axios';

class Landing extends Component {
    constructor() {
        super()
        this.state = {
            loginEmail: '',
            loginPassword: '',
            registerEmail: '',
            registerUsername: '',
            registerPassword: '',
            confirmPassword: ''
        }
    }
    handleChange = e => {
        let { name, value } = e.target

        this.setState({
            [name]: value
        })
    }
    handleLogin = () => {
        if (this.state.registerPassword === this.state.confirmPassword) {
            axios.post('/auth/login', this.state).then(response => {
                this.props.userLoggedIn(response.data)
            }).catch(err => {
                if (typeof err.response.data === 'string')
                    this.props.createAlertMessage(err.response.data);
            });
        }
    }
    handleRegister = () => {
        axios.post('/auth/register', this.state).then(response => {
            let user = response.data
            this.props.userLoggedIn(user)
        }).catch(err => {
            if (typeof err.response.data === 'string')
                this.props.createAlertMessage(err.response.data);
        });
    }
    handleKeyUpL = (e) => {
        if (e.keyCode === 13) {
            this.handleLogin()
        }
    }
    handleKeyUpR = (e) => {
        if (e.keyCode === 13) {
            this.handleRegister()
        }
    }
    render() {
        return (
            <div className="Landing">
                {this.props.isAuthenticated ? <Redirect to="/dashboard" /> : <div>
                    <header className="landingHeader">
                        <h1>ChatterBlock</h1>
                        <section className="LoginBar">
                            <h1>Login: </h1>
                            <input className="loginInputs" name="loginEmail" type="text" placeholder="Email" value={this.state.loginEmail} onChange={this.handleChange} />
                            <input className="loginInputs" name="loginPassword" type="password" placeholder="Password" value={this.state.loginPassword} onChange={this.handleChange} onKeyUp={this.handleKeyUpL} />
                            <button className="loginButton" onClick={this.handleLogin} >Submit</button>
                        </section>
                    </header>

                    <div className="landingBody">
                        <div className="sideways">
                            <div className="registrationForm">
                                <h2>Registration</h2>
                                <input name="registerUsername" type="text" placeholder="username" min="4" maxLength="16" value={this.state.registerUsername} onChange={this.handleChange} />
                                <input name="registerEmail" type="text" placeholder="email" value={this.state.registerEmail} onChange={this.handleChange} />
                                <input name="registerPassword" type="password" placeholder="password" value={this.state.registerPassword} onChange={this.handleChange} />
                                <input name="confirmPassword" type="password" placeholder="confirm password" value={this.state.confirmPassword} onChange={this.handleChange} onKeyUp={this.handleKeyUpR} />
                                {this.state.registerPassword !== this.state.confirmPassword && <div>Passwords do not match</div>}
                                <button onClick={this.handleRegister} >submit</button>
                            </div>

                            <div className="divider" />

                            <div className="whyRegister">
                                <p>Registering will allow you to...</p>
                                <p>Post in channels and create your own!<br />
                                    Send and receive direct messages!<br />
                                    Keep tabs on your friends!</p>
                                <Link to="/dashboard">Continue as Guest</Link>
                            </div>
                        </div>

                    </div></div>}
            </div>
        )
    }
}

function mapStateToProps(state) {
    let { user, isAuthenticated } = state
    return {
        user, isAuthenticated
    }
}

export default connect(mapStateToProps, { userLoggedIn, createAlertMessage })(Landing)