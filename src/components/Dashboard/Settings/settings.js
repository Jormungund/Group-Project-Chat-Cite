import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userLoggedOut, userEdit, createAlertMessage } from '../../../redux/reducer';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import './Settings.css';

class Settings extends Component {
    constructor(){
        super()
        this.state = {
            username: '',
            email: '',
            about_text: '',
            user_image: ''
        }
    }

    componentDidMount(){
        let user = {...this.props.user.user};
        for (let key in user)
            if (user[key] === null)
                user[key] = '';
        this.setState({
            username: user.username,
            email: user.email,
            about_text: user.about_text,
            user_image: user.user_image
        })
    }

    handleClickLogout = () => {
        this.props.socket.disconnect();
        axios.get('/auth/logout').then(response => {
            this.props.userLoggedOut()
        })
    }

    handleClickUpdate = () => {
        axios.put(`/auth/update/${this.props.user.user.id}`, this.state).then(response => {
            this.props.userEdit(response.data)
            this.props.createAlertMessage('Settings Saved');
        })
    }

    handleChange = e => {
        let { name, value } = e.target
    
        this.setState({
          [name]: value
        })
    }

    render(){
        return (
            <div className="Settings">
                {this.props.isAuthenticated ? <div>
                    <div className="settings-header">
                        <h1 style={{color: 'white'}}>Settings</h1>
                        <button style={{height: '40px', borderRadius: '3px'}} onClick={this.handleClickLogout}>Logout</button>
                    </div>
                    
                    <h2>Account details</h2>
                    <section className="editAccount">
                        <h3>Username</h3>
                        <input className="accountInputs" name="username" onChange={this.handleChange} value={this.state.username}></input>
                        <h3>Email</h3>
                        <input className="accountInputs" name="email" onChange={this.handleChange} value={this.state.email}></input>
                        <h3>Summary</h3>
                        <input className="accountInputs" name="about_text" onChange={this.handleChange} value={this.state.about_text} placeholder="About you"></input>
                        <h3>Profile Picture Url</h3>
                        <input className="accountInputs" name="user_image" onChange={this.handleChange} value={this.state.user_image} placeholder="Profile Picture Url"></input>
                        <button onClick={this.handleClickUpdate}>Save Changes</button>
                    </section>
                </div> : <Redirect to="/" /> }
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
  
export default connect(mapStateToProps, { userLoggedOut, userEdit, createAlertMessage })(Settings);