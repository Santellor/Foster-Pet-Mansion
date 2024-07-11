const initialState = {
    userId: null,
    otherValue: "hello",
    username: null,
    loggedIn: false,
    petsToRace: [],
    timer: -1
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
        case "RACE_PETS":
            return {
                ...state,
                petsToRace: action.payload,
            }
        case "TRIATHLON":
            return {
                ...state,
                timer: action.payload
            }
        default:
            return state
    }
}