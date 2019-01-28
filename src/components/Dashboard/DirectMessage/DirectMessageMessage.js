import React, { PureComponent } from 'react';
import getDate from '../../../utils/dateStamp';
import { Link } from 'react-router-dom';

class DirectMessageMessage extends PureComponent {
    render() {
        return (
            <div className="user-message">
                <div className="message-data">
                    <Link to={`/dashboard/profile/${this.props.message.sender_id}`}>{this.props.message.sender}</Link>
                    <div className="time-stamp">{getDate(this.props.message.time_stamp)}</div>
                </div>
                <div className="message-content">{this.props.message.content_text}</div>
            </div>
        )
    }
}

export default DirectMessageMessage