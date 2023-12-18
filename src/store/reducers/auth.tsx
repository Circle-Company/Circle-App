import { AUTHENTICATE, SET_DID_TRY_AUTO_LOGIN, LOGOUT } from "../actions/types"

type initialStateType = {
    token: String | null,
    user: Number,
    didTryAutoLogin: boolean
}

const initialState:initialStateType = {
    token: null,
    user: 0,
    didTryAutoLogin: false
};

export default (state=initialState, action) => {
    switch(action.type){
        case AUTHENTICATE:
            return {
                token: action.token,
                user: action.user,
                didTryAutoLogin: true
            };
        case SET_DID_TRY_AUTO_LOGIN:
            return{
                ...state,
                didTryAutoLogin: true
            };
        case LOGOUT:
            return {
                ...initialState,
                didTryAutoLogin: true
            };
        default:
            return state;
    }
}