import React, { Component } from 'react';
import { connect } from 'react-redux';
import Transition from 'react-addons-css-transition-group';
import InputBar from './InputBar';
import ChannelViewMessage from './ChannelViewMessage';
import { populateChannelUsers, clearUnseenMessages } from '../../../redux/reducer';
import reconcileReactions from './reconcileReactions';
import './ChannelView.css';

class ChannelView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typingUsers: [],
            messages: [],
            channelId: -1,
            typing: false,
            messageFilter: '',
            messagesBelow: false,
            noSuchChannel: false,
            initialLoadComplete: false
        };
        this.messageWindowRef = React.createRef();
        this.lastMessageRef = React.createRef();
        this.sendMessage = this.sendMessage.bind(this);
        this.checkForScrollDown = this.checkForScrollDown.bind(this);
        this.likeMessage = this.likeMessage.bind(this);

        /*
            Socket Listeners
        */

        this.props.socket.on('send initial response', initialResponse => {
            initialResponse.existingMessages = reconcileReactions(initialResponse.existingMessageReactions, initialResponse.existingMessages);
            this.props.populateChannelUsers(initialResponse.users);
            this.setState({
                messages: initialResponse.existingMessages,
                channelId: initialResponse.channelId,
                channelName: initialResponse.channelName,
                noSuchChannel: false
            }, this.forceScrollDown);
            this.props.clearUnseenMessages(initialResponse.channelName);
        });
        this.props.socket.on('new message', newMessage => {
            let messages = [...this.state.messages];
            messages.push(newMessage);
            this.setState({ messages });
            // this.userNotTyping(newMessage.username)
        });
        this.props.socket.on('message was reacted to', (messageId, reactionName, username) => {
            const { messages } = this.state;
            // find the message
            const messageIndex = messages.findIndex(message => message.id === messageId)
            if (messageIndex === -1)
                return;
            // check if message has any reactions
            if (messages[messageIndex].reactions) {
                // check if it has reactions of the specified type
                if (messages[messageIndex].reactions[reactionName]) {
                    // check for the username in reactions of the specified type
                    const usernameIndex = messages[messageIndex].reactions[reactionName].indexOf(username);
                    // add the username to that array if it's not there
                    if (usernameIndex === -1) {
                        messages[messageIndex].reactions[reactionName].push(username);
                    } else {
                        // remove it if it is there
                        messages[messageIndex].reactions[reactionName] = messages[messageIndex].reactions[reactionName].filter(reactionUsername => reactionUsername !== username);
                        if (messages[messageIndex].reactions[reactionName].length === 0)
                            delete messages[messageIndex].reactions[reactionName];
                        if (Object.keys(messages[messageIndex].reactions).length === 0 && messages[messageIndex].reactions.constructor === Object)
                            delete messages[messageIndex].reactions;
                    }
                } else {
                    // if no reactions of the specified type set them up
                    messages[messageIndex].reactions[reactionName] = [];
                    messages[messageIndex].reactions[reactionName].push(username);
                }

            } else {
                // if no reactions at all set them up
                messages[messageIndex].reactions = {};
                messages[messageIndex].reactions[reactionName] = [];
                messages[messageIndex].reactions[reactionName].push(username);
            }
            this.setState({ messages });
        });
        this.props.socket.on('user joined channel', newUser => {
            let channelUsers = [...this.props.channelUsers];
            if (channelUsers.findIndex(existingUser => existingUser.id === newUser.id && existingUser.online === newUser.online) !== -1)
                return;
            if (newUser.subbed) {
                let userIndex = channelUsers.findIndex(existingUser => existingUser.id === newUser.id)
                if (userIndex !== -1)
                    channelUsers[channelUsers.findIndex(existingUser => existingUser.id === newUser.id)].online = true;
                else {
                    channelUsers.push(newUser)
                }
            }
            else
                channelUsers.push(newUser);
            channelUsers.sort((a, b) => a.username < b.username ? -1 : 1);
            this.props.populateChannelUsers(channelUsers);
        });
        this.props.socket.on('user left channel', username => {
            let channelUsers = [...this.props.channelUsers];
            const userIndex = channelUsers.findIndex(user => user.username === username);
            if (channelUsers[userIndex].subbed)
                channelUsers[userIndex].online = false;
            else
                channelUsers = channelUsers.filter(user => user.username !== username);
            this.props.populateChannelUsers(channelUsers);
        });
        this.props.socket.on('stopped typing', username => {

        });
        this.props.socket.on('is typing', username => {
            let typing = this.state.typingUsers
            if (typing.indexOf(username) === -1) {
                typing.push(username)
                this.setState({
                    typingUsers: typing
                })
                setTimeout(this.userNotTyping, 3000)
            }
        });
        this.props.socket.on('user subbed to channel', newSubUser => {
            const channelUsers = [...this.props.channelUsers];
            const userIndex = channelUsers.findIndex(user => user.id === newSubUser.id);
            if (userIndex === -1)
                channelUsers.push(newSubUser);
            else
                channelUsers[userIndex].subbed = true;
            this.props.populateChannelUsers(channelUsers);
        });
        this.props.socket.on('user unsubbed from channel', userId => {
            let channelUsers = [...this.props.channelUsers];
            const userIndex = channelUsers.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                if (channelUsers[userIndex].online)
                    channelUsers[userIndex].subbed = false;
                else
                    channelUsers = channelUsers.filter(user => user.id !== userId);
                this.props.populateChannelUsers(channelUsers);
            }
        });

        this.props.socket.on('no such channel', () => {
            this.setState({ noSuchChannel: true, initialLoadComplete: true })
        })

        /*
            End Socket Listeners
        */
    }

    /*
        Lifecyle Methods
    */

    componentDidMount() {
        const { channelName } = this.props.match.params;
        this.props.socket.emit('join channel', channelName);       
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.channelName !== this.props.match.params.channelName) {
            this.props.socket.emit('leave channel');
            const { channelName } = this.props.match.params;
            this.setState({ initialLoadComplete: false }, () => this.props.socket.emit('join channel', channelName));
            // this.props.socket.emit('join channel', channelName);
        }
        const { clientHeight, scrollHeight, scrollTop } = this.messageWindowRef.current;
        if (this.lastMessageRef.current && this.state.initialLoadComplete) {
            if (scrollHeight - scrollTop - this.lastMessageRef.current.clientHeight <= clientHeight + 150)
                this.messageWindowRef.current.scrollTop = this.messageWindowRef.current.scrollHeight;
            else {
                if (prevState.messages.length !== this.state.messages.length)
                    this.setState({ messagesBelow: true });
            }
        }
    }
    componentWillUnmount() {
        this.props.socket.emit('leave channel');
        this.props.socket.off('new message');
        this.props.socket.off('user joined channel');
        this.props.socket.off('send initial response');
        this.props.socket.off('user left channel');
        this.props.populateChannelUsers([]);
    }

    /*
        User Input
    */

    userNotTyping = (x) => {
        let typing = this.state.typingUsers
        typing.splice(typing.indexOf(x), 1)
        this.setState({
            typingUsers: typing
        })
        this.props.socket.emit('stopped typing');
    }
    isTyping = () => {
        this.setState({
            typing: true
        })
        this.props.socket.emit('is typing');
        setTimeout(this.notTyping, 3000)
    }

    notTyping = () => {
        this.setState({
            typing: false
        })
        this.props.socket.emit('stopped typing');

    }

    /*
        Message Functionality
    */

    sendMessage(newMessage) {
        if (!this.props.user)
            return;
        if (newMessage.trim()) {
            const message = {
                contentText: newMessage,
                channelId: this.state.channelId
            }
            this.props.socket.emit('create message', message);
        }
    }
    likeMessage(messageId, val) {
        if (!this.props.user)
            return;
        this.props.socket.emit('react to message', messageId, this.state.channelId, val);
    }

    /*
        UI Methods
    */

    updateInput(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    checkForScrollDown() {
        if (this.state.messagesBelow) {
            const { scrollHeight, scrollTop, clientHeight } = this.messageWindowRef.current;
            if (scrollHeight - scrollTop === clientHeight) {
                this.setState({ messagesBelow: false });
            }
        }
    }
    forceScrollDown() {
        this.messageWindowRef.current.scrollTop = this.messageWindowRef.current.scrollHeight;
        this.setState({ initialLoadComplete: true });
    }


    /*
        Render Methods
    */

    renderMessages() {
        if (!this.state.messages[0])
            return <div className="user-message">No messages in this channel yet. Start chatting!</div>
        let messages = [...this.state.messages];
        if (this.state.messageFilter.trim())
            messages = messages.filter(message => message.content_text.includes(this.state.messageFilter.trim()))
        return messages.map((message, i) => {
            let messageRef = '';
            if (i === messages.length - 1)
                messageRef = this.lastMessageRef;
            let messageReactionKey = 0;
            if (message.reactions) {
                for (let key in message.reactions) {
                    if (message.reactions[key])
                        messageReactionKey += message.reactions[key].length;
                }
            }

            return (
                <ChannelViewMessage
                    message={message}
                    messageRef={messageRef}
                    likeMessage={this.likeMessage}
                    key={i}
                    messageReactionKey={messageReactionKey}
                // likes={message.reactions ? message.reactions.like ? message.reactions.like.length : 0 : 0 }

                />
            )
        });
    }

    render() {
        const componentLoadingStyles = this.state.initialLoadComplete ? { animationName: 'fadeIn' } : { opacity: 0 };
        const messagesLoadingStyles = this.state.initialLoadComplete ? { scrollBehavior: 'smooth' } : { scrollBehavior: 'initial' }
        return (
            <div className="ChannelView" style={componentLoadingStyles}>
                <div className="header">
                    <h2 className="channel-name">#{this.state.noSuchChannel ? 'Channel Does\'t Exist' : this.state.channelName}</h2>
                    <input
                        type="text"
                        name="messageFilter"
                        className="message-filter"
                        placeholder="Filter Messages"
                        value={this.state.messageFilter}
                        onChange={e => this.updateInput(e)}
                    />
                </div>
                <div className="messages" ref={this.messageWindowRef} onScroll={this.checkForScrollDown} style={messagesLoadingStyles}>
                    <Transition
                        transitionName="mbt"
                        transitionEnterTimeout={200}
                        transitionLeaveTimeout={200}
                    >
                        {this.state.messagesBelow ?
                            <div className="messages-below" onClick={e => this.forceScrollDown()}>New Messages Below</div>
                            : null}
                    </Transition>
                    {this.state.noSuchChannel ?
                        <div className="user-message">This channel doesn't exist, but you can create it by clicking the + icon in the lefthand navigation bar.</div>
                        :
                        this.renderMessages()
                    }
                </div>
                {/* {displayTypingUsers} */}
                <div className="input-holder">
                    <InputBar socket={this.props.socket} sendMessage={this.sendMessage} />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { isAuthenticated, user, channelUsers } = state;
    return {
        user,
        isAuthenticated,
        channelUsers
    }
}

export default connect(mapStateToProps, { populateChannelUsers, clearUnseenMessages })(ChannelView);