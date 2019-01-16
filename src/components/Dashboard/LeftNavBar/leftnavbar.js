import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./leftnavbar.css";
import { connect } from 'react-redux';
import { userLoggedOut } from '../../../redux/reducer';
import axios from 'axios';
import Popup from 'reactjs-popup'

class NavBar extends Component {
    constructor() {
        super()
        this.state = {
            searchInput: "",
            channel_name: "",
            channels: [],
            subChannels: [],
            description: ''
        }
    }

    componentDidMount() {

        axios.get('/api/channel/all/subscribed/message/count', this.props.user.id).then(response => {
            this.setState({
                subChannels: response.data
            })
        }).catch(err => { console.log(`Error! Did not get all Channels! ${err}`) })

        axios.get('/api/channel/all').then(response => {
            this.setState({
                channels: response.data
            })
        }).catch(err => { console.log(`Error! Did not get all Channels! ${err}`) })
    }

    handleChannel = (val) => {
        this.setState({
            channel_name: val
        })
    }

    handleDescription = (val) => {
        this.setState({
            description: val
        })
    }

    handleAddChannel = (e) => {

        if (e.keyCode === 13) {
            axios.post('/api/channel/new', this.state).then(response => {

                this.setState({
                    channels: [...this.state.channels, response.data],
                    channel_name: ""
                })
            })
        }
    }
    handleSearch = (val) => {
        this.setState({
            searchInput: val
        })
    }

    Modal =  () => (
        <Popup
          trigger={<button className="button"> Open Modal </button>}
          modal
          closeOnDocumentClick
        >
          <span> Modal content </span>
        </Popup>
      )

    render() {
        const { channels, searchInput, subChannels } = this.state;

        const channelDisplay = channels.filter(channel => {
            return channel.channel_name.toLowerCase().includes(searchInput.toLowerCase());
        }).map((channel, i) => {
            return <div key={channel.id} className="channel-list"><Link to={`/dashboard/channel/${channel.channel_name}`} className="channel-link"><h4 className="channel-name">{channel.channel_name}</h4> </Link></div>
        })
        const subChannelsDisplay = subChannels.map(channel => {
            return <div key={channel.id} className="channel-list"><Link to={`/dashboard/channel/${channel.channel_name}`} className="channel-link"><h4 className="channel-name">{channel.channel_name}</h4> {channel.count > 0 ? <p className="unseen-channel-messages">{channel.count}</p> : false}</Link></div>
        })

        console.log(this.state.description.length);

        let count = 100;

        count -= this.state.description.length;

     
        return (
            <div className="NavBar">
                <div className="nav-top">
                    <div className="navLogo"><h2>Logo Here</h2>{this.props.isAuthenticated ? <Link to="/dashboard">Recent</Link> : <Link to="/">Home</Link>}</div>
                    
                    <div className="accordion" id="accordionExample">
                    {this.props.isAuthenticated ? 
                        <div className="card">
                            <div className="card-header" id="headingOne">
                                <h2 className="mb-0">
                                    <button className="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="">
                                        Active Channels
                                </button>
                                </h2>
                            </div>
                            <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                                <div className="card-body">
                                    <ul className="leftbarUL">
                                    {subChannelsDisplay}
                                    </ul>
                                </div>
                            </div>
                        </div>: <div></div>}
                        {this.props.isAuthenticated ? 
                        <div className="card">
                            <div className="card-header" id="headingTwo">
                                <h2 className="mb-0">
                                    <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                        Direct Messages
                                </button>
                                </h2>
                            </div>
                            <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                                <div className="card-body">
                                    <ul className="leftbarUL">
                                        <Link to="/dashboard/dms"><li>Brian</li></Link>
                                        <li>Alan</li>
                                        <li>Heather</li>
                                        <li>Jack</li>
                                    </ul>
                                </div>
                            </div>
                        </div>: <div></div>}
                        
                        <div className="card">
                            <div className="card-header" id="headingThree">
                                <h2 className="mb-0">
                                    <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                        Channels
                                </button>
                                </h2>
                            </div>
                            <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                                <div className="card-body">
                                    <input className="searchInput" type="text" value={this.state.searchInput} onChange={(e) => this.handleSearch(e.target.value)} placeholder="Find Channel" />
                                    <span className="addChannel">  <Popup
    trigger={<button className="button"> + </button>}
    modal
    closeOnDocumentClick
  >
    <h1 style={{color: "green", textAlign: 'center'}}> Add Channel </h1>
    <hr />
    <div>
        <h6 style={{ color: "blue", textAlign: "right", paddingRight: "35px"}}>Characters left: {count}</h6>
    <label style={{color: "black", paddingRight: "10px"}}>Add Channel: </label>
    <input className="addChannelBar" value={this.state.channel_name} type="text" placeholder="Channel to be added" onChange={(e) => this.handleChannel(e.target.value)} onKeyUp={this.handleAddChannel} />
    <label style={{color: "black", paddingRight: "10px"}}>Channel Description: </label>
    <input className="addChannelBar" value={this.state.description} type="text" maxLength="100" placeholder="Channel Description" onChange={(e) => this.handleDescription(e.target.value)}/>
    </div>

  </Popup></span><br /><br />
                                    <ul className="leftbarUL">
                                        {channelDisplay}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.isAuthenticated ?
                    <div className="profileAndSettings">
                        <Link to={`/dashboard/profile/${this.props.user.user.id}`} >{this.props.user.user.username}</Link>
                        <Link to="/dashboard/settings" ><i className="fas fa-cog"></i></Link>
                    </div> :
                    <div className="profileAndSettings">
                        <h3>Guest</h3>
                    </div>
                }
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

export default connect(mapStateToProps, { userLoggedOut })(NavBar);