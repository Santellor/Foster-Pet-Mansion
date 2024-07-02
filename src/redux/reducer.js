const initialState = {
    userId: null,
    otherValue: "hello",
    username: null,
    loggedIn: false
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "USER_AUTH":
            return {
                ...state,
                userId: action.payload.userId,
                username: action.payload.username,
                loggedIn: true
            }
        case "LOGOUT":
            return {
                ...state,
                userId: null,
                username: null,
                loggedIn: false
            }
        default:
            return state
    }
}