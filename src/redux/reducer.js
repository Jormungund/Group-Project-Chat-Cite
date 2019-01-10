const USER_LOGGED_IN = 'USER_LOGGED_IN'
const USER_LOGGED_OUT = 'USER_LOGGED_OUT'
const USER_EDIT = 'USER_EDIT'
const POPULATE_FRIENDS = 'POPULATE_FRIENDS'

const initialState = {
  isAuthenticated: false,
  user: {},
  friends: []
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGGED_IN:
      return { ...state, isAuthenticated: true , user: action.payload }
    case USER_LOGGED_OUT:
      return { ...state, isAuthenticated: false, user: {} }
    case USER_EDIT:
      return { ...state, user: action.payload }
    case POPULATE_FRIENDS:
      return {...state, friends: action.payload}
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
  console.log('\n\nfriends: ', friends);
  return {
    type: POPULATE_FRIENDS,
    payload: friends
  }
}