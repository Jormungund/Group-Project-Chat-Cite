import React from 'react';
import { Link } from 'react-router-dom';
import getDate from '../../../utils/dateStamp';

class Message extends React.PureComponent {
    constructor(){
        super()
        this.state={
            reactionOptions:[
                {value:'thumbs-up',
                class: 'fas fa-thumbs-up'
                },
                {value: 'thumbs-down',
                class: 'fas fa-thumbs-down'
                },
                {value: 'tired',
                class: 'fas fa-tired'
                },
                {value: 'surprise',
                class: 'fas fa-surprise'
                },
                {value: 'smile-wink',
                class: 'fas fa-smile-wink'
                },
                {value: 'smile-beam',
                class: 'fas fa-smile-beam'
                },
                {value: 'sad-tear',
                class: 'fas fa-sad-tear'
                },
                {value: 'sad-cry',
                class: 'fas fa-sad-cry'
                },
                {value: 'meh-rolling-eyes',
                class: 'fas fa-meh-rolling-eyes'
                },
                {value: 'meh',
                class: 'fas fa-meh'
                },
                {value: 'grin-wink',
                class: 'fas fa-grin-wink'
                },
                {value: 'grin-squint-tears',
                class: 'fas fa-grin-squint-tears'
                },
                {value: 'grin-hearts',
                class: 'fas fa-grin-hearts'
                },
                {value: 'grin-beam',
                class: 'fas fa-grin-beam'
                },
                {value: 'grin-alt',
                class: 'fas fa-grin-alt'
                },
                {value: 'grin',
                class: 'fas fa-grin'
                },
                {value: 'laugh-wink',
                class: 'fas fa-laugh-wink'
                },
                {value: 'laugh-squint',
                class: 'fas fa-laugh-squint'
                },
                {value: 'laugh-beam',
                class: 'fas fa-laugh-beam'
                },
                {value: 'kiss-wink-heart',
                class: 'fas fa-kiss-wink-heart'
                },
                {value: 'kiss-beam',
                class: 'fas fa-kiss-beam'
                },
                {value: 'kiss',
                class: 'fas fa-kiss'
                },
                {value: 'kiss-beam',
                class: 'fas fa-kiss-beam'
                },
                {value: 'grin-tongue-squint',
                class: 'fas fa-grin-tongue-squint'
                },
                {value: 'grin-tongue',
                class: 'fas fa-grin-tongue'
                },
                {value: 'frown-open',
                class: 'fas fa-frown-open'
                },
                {value: 'frown',
                class: 'fas fa-frown'
                },
                {value: 'flushed',
                class: 'fas fa-flushed'
                },
                {value: 'dizzy',
                class: 'fas fa-dizzy'
                }
            ],
            displayReactions: false
        }
        this.close = this.close.bind(this)

    }

    showReactionOptions = () => {
        if(this.state.displayReactions === false){
            this.setState({
                displayReactions: !this.state.displayReactions
            })
            document.addEventListener('click', this.close)
            document.addEventListener('contextmenu', this.close)
        } else {
            this.close()
        }
    }

    close ()  {
        this.setState({
            displayReactions: !this.state.displayReactions
        })
        document.removeEventListener('click', this.close)
        document.removeEventListener('contextmenu', this.close)
    }

    render() {
        let reactionOptions = this.state.reactionOptions.map((reaction,i) =>{
            return <div className="message-reaction-option" key={i} onClick={() => {this.props.likeMessage(this.props.message.id, reaction.value);this.showReactionOptions()}}>
            <span>
                <i className={reaction.class} value={reaction.value}>
                </i>
                </span>
            </div>
        })

        let reactions = []
        for (var key in this.props.message.reactions){
            reactions.push([key])    
        }
        let userReactions = reactions.map((reaction,i) =>{
            return <div key={i} className="message-reactions">
                <span>
                    <i className={`fas fa-${reaction}`} value={reaction} onClick={() => this.props.likeMessage(this.props.message.id, reaction[0])}></i>{this.props.message.reactions[reaction].length > 1 ? this.props.message.reactions[reaction].length:null}
                </span>
            </div>
        })
        
        return (
            <div className="user-message" ref={this.props.messageRef}>
                <div className="message-data">
                    <Link to={`/dashboard/profile/${this.props.message.user_id}`}>{this.props.message.username}</Link>
                    <div className="time-stamp">{getDate(this.props.message.time_stamp)}</div>
                </div>
                <div className="message-content">{this.props.message.content_text}</div>
                <div className="toggleReactions" id="toggleReactions">
                <i className="fas fa-smile" onClick={this.showReactionOptions}/>
                </div>
                <div className="reaction-options">
                    {this.state.displayReactions === true ?
                    <div id="someId">
                        <div onClick={(e) => e.stopPropagation()}>
                        {reactionOptions}
                        </div>
                    </div>
                :
                null
                }
                </div>
               
                <div className="userReactions">
                {userReactions}
                </div>
            </div>
        )
    }
}

export default Message;