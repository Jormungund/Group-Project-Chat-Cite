import React, { Component } from 'react';
import './FriendsPopup.css';

class FriendsPopup extends Component {
    constructor(props){
        super(props);

        this.state = {
            show: false,
            x: 0,
            y: 0
        }
    }
    deleteFriend(user) {
        this.props.socket.emit('delete friend', user);
    }
    handleClick = (event) => {
        event.preventDefault();

        if (event.type === 'contextmenu') {
            this.setState({ show: true }, () => {
                document.addEventListener('click', this.closeMenu);
                document.addEventListener('contextmenu', this.closeMenu);
            });
        }
    }

    closeMenu = () => {
        this.setState({ show: false }, () => {
          document.removeEventListener('click', this.closeMenu);
          document.removeEventListener('contextmenu', this.closeMenu);
        });
    }

    handleMouse = e => {

        this.setState({ x: e.clientX, y: e.clientY })
    }

    render(){
        const { friend } = this.props;
        return (
            <div className="friend noselect">
                <div className="clickable" onMouseDown={e=>this.handleMouse(e)} onContextMenu={this.handleClick}>{friend.username}</div>
                {this.state.show && <div className="popupmenu" style={{top: this.state.y, left: `calc(${this.state.x}px - 200px`}}>
                    <div className="popup-sections" onClick={() => {this.props.history.push(`/dashboard/profile/${friend.id}`)}}>Profile</div>
                    <div className="popup-sections" onClick={() => {this.props.history.push(`/dashboard/dm/${friend.username}`)}}>Send Message</div>
                    <span onClick={e => this.deleteFriend({id: friend.id, username: friend.username})} className="delete">Remove Friend</span>

                </div>}
            </div>
        )
    }
}

export default FriendsPopup;