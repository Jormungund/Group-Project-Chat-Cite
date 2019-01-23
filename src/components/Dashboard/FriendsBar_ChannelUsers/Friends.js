import React, { Component } from 'react';
import './Friends.css';
import { connect } from 'react-redux';
import { populateFriends, createAlertMessage } from '../../../redux/reducer';
import FriendsPopup from './popup';
import Popup from 'reactjs-popup';

class Friends extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requestedFriend: '',
            pendingFriends: []
        }
        this.props.socket.on('send your friends', myFriends => {
            this.props.populateFriends(myFriends);
        });
        this.props.socket.on('friend went offline', friendId => {
            const updatedFriends = this.props.friends.map(friend => {
                if (friend.id === friendId)
                    friend.online = false;
                return friend;
            });
            this.props.populateFriends(updatedFriends);
        });
        this.props.socket.on('friend came online', friendId => {
            const updatedFriends = this.props.friends.map(friend => {
                if (friend.id === friendId)
                    friend.online = true;
                return friend;
            })
            this.props.populateFriends(updatedFriends);
        });
        this.props.socket.on('confirm friend request', confirmation => {
            this.props.createAlertMessage(confirmation);
        });
        this.props.socket.on('new friend request', requester => {
            let { pendingFriends } = this.state;
            pendingFriends.push(requester);
            this.setState({ pendingFriends });
            this.props.createAlertMessage('New friend request from ' + requester.username + '.');
        });
        this.props.socket.on('send pending requests', pendingRequests => {
            if (pendingRequests !== 'no requests pending')
                this.setState({ pendingFriends: pendingRequests })
            else
                this.setState({ pendingFriends: [] });
        });
        this.props.socket.on('friend update complete', () => {
            this.props.socket.emit('get my friends');
            this.props.socket.emit('get pending friend requests');
        })
    }
    componentDidMount() {
        this.props.socket.emit('get my friends');
        this.props.socket.emit('get pending friend requests');
    }
    componentWillUnmount() {
        this.props.socket.off('send your friends');
        this.props.socket.off('friend went offline');
        this.props.socket.off('friend came online');
        this.props.socket.off('send pending requests');
        this.props.socket.off('confirm friend request');
        this.props.socket.off('new friend request');
        this.props.socket.off('friend update complete');

    }
    updateInput(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    requestFriend() {
        if (this.props.friends.findIndex(friend => friend.username === this.state.requestedFriend) !== -1)
            return this.props.createAlertMessage(`${this.state.requestedFriend} is already your friend`);
        this.props.socket.emit('request friend', this.state.requestedFriend);
        this.setState({ requestedFriend: '' });
    }
    acceptFriend(user) {
        this.props.socket.emit('accept friend', user);
    }
    rejectFriend(user) {
        this.props.socket.emit('reject friend', user);
    }
    renderFriends() {
        const onlineFriends = this.props.friends
            .filter(friend => friend.online)
            .sort((a, b) => a.username < b.username ? -1 : 1)
            .map((friend, i) =>
                <li key={i}>
                    <FriendsPopup friend={friend} socket={this.props.socket} {...this.props}/>
                </li>
            );
        const offlineFriends = this.props.friends
            .filter(friend => !friend.online)
            .sort((a, b) => a.username < b.username ? -1 : 1)
            .map((friend, i) =>
                <li key={i}>
                    <FriendsPopup friend={friend} socket={this.props.socket} {...this.props}/>
                </li>
            );
        const pendingFriends = this.state.pendingFriends
            .sort((a, b) => a.username < b.username ? -1 : 1)
            .map((friend, i) =>
                <li style={{width: '100%'}} key={i}>
                    {friend.username}
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <span onClick={e => this.acceptFriend({ id: friend.id, username: friend.username })} className="accept-reject">Accept</span>&nbsp;&nbsp;
                        <span onClick={e => this.rejectFriend({ id: friend.id, username: friend.username })} className="accept-reject">Reject</span>
                    </div>
                </li>
            );
        return (
            <div>
                <div style={{fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', paddingRight: '20px'}}>
                    <h3 style={{fontWeight: 'bold'}}>Pending</h3> 
                    <Popup trigger={<i className="fas fa-plus"></i>} position="bottom right">
                        <input 
                            type="text"
                            name="requestedFriend"
                            placeholder="add friend" 
                            value={this.state.requestedFriend}  
                            onChange={e => this.updateInput(e)}
                            onKeyPress={e => {if (e.key === "Enter") this.requestFriend()}}
                        />
                    </Popup>
                </div>
                <ul className="pending-friends">
                    {pendingFriends}
                </ul>
                <h4 style={{letterSpacing: "3px",paddingBottom: "10px", borderBottom: "1px solid lightgrey", textAlign: "center", width: "70%"}}>My Friends</h4>
                <div style={{fontWeight: 'bold'}}>Online</div>
                <ul className="online-friends" style={{marginBottom: 10}}>
                    {onlineFriends}
                </ul>
                <div style={{ fontWeight: 'bold' }}>Offline</div>
                <ul className="offline-friends" style={{ marginBottom: 10 }}>
                    {offlineFriends}
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div className="Friends clearfix">
                <div className="friends-holder">
                    {this.renderFriends()}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    let { friends } = state;
    return {
        friends
    }
}

export default connect(mapStateToProps, { populateFriends, createAlertMessage })(Friends);