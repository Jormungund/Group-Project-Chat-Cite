const USER_LOGGED_IN = 'USER_LOGGED_IN'
const USER_LOGGED_OUT = 'USER_LOGGED_OUT'
const USER_EDIT = 'USER_EDIT'
const POPULATE_FRIENDS = 'POPULATE_FRIENDS'
const POPULATE_CHANNEL_USERS = 'POPULATE_CHANNEL_USERS'
const POPULATE_ACTIVE_DMS = 'POPULATE_ACTIVE_DMS'
const CREATE_ALERT_MESSAGE = 'CREATE_ALERT_MESSAGE'


const initialState = {
    isAuthenticated: false,
    user: {},
    friends: [],
    channelUsers: [],
    activeDms: [],
    alertMessage: {}

}

let alertCount = 0;

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case USER_LOGGED_IN:
            return { ...state, isAuthenticated: true, user: action.payload };
        case USER_LOGGED_OUT:
            return { ...state, isAuthenticated: false, user: {} };
        case USER_EDIT:
            return { ...state, user: action.payload };
        case POPULATE_FRIENDS:
            return { ...state, friends: action.payload };
        case POPULATE_CHANNEL_USERS:
            return { ...state, channelUsers: action.payload };
        case POPULATE_ACTIVE_DMS:
            return { ...state, activeDms: action.payload };
        case CREATE_ALERT_MESSAGE:
            alertCount++;
            return { ...state, alertMessage: {message: action.payload, alertCount }};
        default:
            return state;
    }
}

export function userLoggedIn(user) {
    return {
        type: USER_LOGGED_IN,
        payload: user
    }
}

export function userLoggedOut() {
    return {
        type: USER_LOGGED_OUT
    }
}

export function userEdit(user) {
    return {
        type: USER_EDIT,
        payload: user
    }
}

export function populateFriends(friends) {
    return {
        type: POPULATE_FRIENDS,
        payload: friends
    }
}

export function populateChannelUsers(users) {
    return {
        type: POPULATE_CHANNEL_USERS,
        payload: users
    }
}

export function populateActiveDms(users) {
    return {
        type: POPULATE_ACTIVE_DMS,
        payload: users
    }
}

export function createAlertMessage(alertMessage) {
    return {
        type: CREATE_ALERT_MESSAGE,
        payload: alertMessage
    }
}