import React, { Component } from 'react';
import './Profiles.css'
import { connect } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Profile extends Component {
    constructor(){
        super()

        this.state = {
            profileInfo: {},
        }
    }
    componentDidMount(){
        this.getUser();
    }
    componentDidUpdate(prevProps){
        if(prevProps.match.params.id !== this.props.match.params.id){
            this.getUser();
        }
    }

    getUser = () => {
        axios.get(`/api/profile/${this.props.match.params.id}`).then(response => {
            this.setState({profileInfo: response.data}) 
        })
    }
    
    render(){
        return (
            <div className="Profiles">
                {this.state.profileInfo.user && 
                
                <div className="mainProfile">
                <div className="profileHeader">
                        <div className="profileImage"><img src={this.state.profileInfo.user.user_image} alt="profile pic"/></div>
                        <h1>{this.state.profileInfo.user.username}</h1>
                        <div className="profileImage" />
                </div>
                <div className="profileSection1">
                    <div className="about">
                        {this.state.profileInfo.user.about_text ? <div><div style={{marginBottom: '10px'}}>Summary:</div><div style={{fontSize: '20px'}}>{this.state.profileInfo.user.about_text}</div></div> : <h3>You do not have a summary yet.</h3>}
                    </div>
                    <div className="about">
                        <div><div style={{marginBottom: '10px'}}>Subscribed Channels:</div>{this.state.profileInfo.userSubChannels.map((channel, i) => {
                            return (
                            <p key={i} className="channels">  
                                <Link to={`/dashboard/channel/${channel.channel_url}`} className="Links">{channel.channel_name}</Link>
                            </p>             
                        )})}</div>
                    </div>
                </div>

                <div className="profileSection1">
                    <div className="about">
                        <div><div style={{marginBottom: '10px'}}>Friends:</div>{this.state.profileInfo.userFriends.map((friend, i) => {
                            return (
                            <p key={i} className="channels">  
                                <Link to={`/dashboard/profile/${friend.friend_id}`} className="Links">{friend.username}</Link>
                            </p>             
                        )})}</div>
                    </div>
                    <div className="about">
                        <div><div style={{marginBottom: '10px'}}>Total Posts: {this.state.profileInfo.postMeta.count}</div><div style={{marginBottom: '10px'}}>Recent Posts:</div>{this.state.profileInfo.profileRecentMessages.map((message, i)=> {
                            return (
                            <p key={i} className="channels">
                                {message.content_text}
                            </p>
                        )})}</div>
                    </div>
                </div>
                </div>}
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
  
export default connect(mapStateToProps)(Profile);