import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import NavBar from './LeftNavBar/LeftNavBar';
import ChannelView from './ChannelView/ChannelView';
import Recent from './Recent/Recent';
import Profile from './Profiles/Profiles';
import Settings from './Settings/Settings';
import FriendUserBar from './FriendsBar_ChannelUsers/FriendUserBar';
import DirectMessage from './DirectMessage/DirectMessage';
import { connect } from 'react-redux';
import { createAlertMessage } from '../../redux/reducer';
import './Dashboard.css';
import io from 'socket.io-client';
let socket;

class Dashboard extends Component {
    constructor() {
        super();
        socket = io();
        socket.on('send user feedback', feedback => {
            this.props.createAlertMessage(feedback);
        });
    }
    showNav = (e, a) => {
        var x = document.getElementById(e);
        var y = document.getElementById(a);
        if (x.style.display === "none") {
            x.style.display = "block";
            y.style.display = "none";
        } else {
            x.style.display = "none";
        }
    }
    render() {
        return (
            <Route path="/dashboard" render={(props) => {
                return (
                    <div className="Dashboard">
                        <NavBar socket={socket} />
                        <div className="center-container">
                            <Switch>
                                <Route path="/dashboard" exact component={Recent} />
                                <Route path="/dashboard/channel/:channelName" render={props =>
                                    <ChannelView
                                        {...props}
                                        socket={socket}
                                    />}
                                />
                                <Route path="/dashboard/profile/:id" component={Profile} />
                                <Route path="/dashboard/settings" render={props =>
                                    <Settings
                                        {...props}
                                        socket={socket}
                                    />}
                                />
                                <Route path="/dashboard/dm/:username" render={props =>
                                    <DirectMessage
                                        {...props}
                                        socket={socket}
                                    />}
                                />
                            </Switch>
                        </div>
                        <FriendUserBar socket={socket} {...props} />
                        {/* <MobileNav /> */}
                        <div className="mobile-nav">
                            <div className="mobile-nav-link" ><i className="fas fa-cog"></i></div>
                            <div className="mobile-nav-link" name="Channels" onClick={(e, a) => this.showNav("NavBar", "FriendUserBar")}><i className="fas fa-comments"></i></div>
                            <div className="mobile-nav-link" name="FriendUserBar" onClick={(e, a) => this.showNav("FriendUserBar", "NavBar")}><i className="fas fa-user-friends"></i></div>
                        </div>
                    </div>
                )
            }}
            />)
    }
}

function mapStateToProps(state) {
    let { user } = state
    return {
        user
    }
}

export default connect(mapStateToProps, { createAlertMessage })(Dashboard);