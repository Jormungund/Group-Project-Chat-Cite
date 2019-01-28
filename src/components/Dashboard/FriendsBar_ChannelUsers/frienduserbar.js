import React, { Component } from 'react';
import './FriendUserBar.css'
import { connect } from 'react-redux';
import Friends from './Friends';
import ChannelUsers from './ChannelUsers';

class FriendUserBar extends Component {
    render(){
        return (
            <div className="FriendUserBar">
                {this.props.isAuthenticated ?
                    <Friends socket={this.props.socket} {...this.props}/>
                :
                    null
                }
                <ChannelUsers socket={this.props.socket} {...this.props}/>
            </div>
        )
    }
}

const mapStateToProps = state => {
    let { isAuthenticated } = state;
    return {
        isAuthenticated
    }
}

export default connect(mapStateToProps, null)(FriendUserBar);