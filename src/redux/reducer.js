const initialState = {
    userId: null,
    otherValue: "hello",
    username: null,
    loggedIn: false,
    petsToRace: [],
    petsToHybrid: [],
    timer: -1,
    muted: false,
    soundPlaying: false
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
                loggedIn: false,
                muted: true
            }
        case "RACE_PETS":
            return {
                ...state,
                petsToRace: action.payload,
            }
        case "HYBRID_PETS":
            return {
                ...state,
                petsToHybrid: action.payload,
            }
        case "TRIATHLON":
            return {
                ...state,
                timer: action.payload
            }
        case "VOLUME":
            return {
                ...state,
                muted: action.payload.muted,
                soundPlaying: action.payload.soundPlaying
            }
        default:
            return state
    }
}