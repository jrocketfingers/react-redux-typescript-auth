import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import actionCreatorFactory from "redux-typescript-actions";

// filthy hack around typescripts inability to understand babel's default exports
// proper way:
// import createLogger from 'redux-logger';
import * as createLogger from "redux-logger";


const actionCreator = actionCreatorFactory();

interface IError {
  code: number,
  message: string
}

interface INoResponse {}

interface IUser {
  username: string,
  token: string
}

interface IAuthState {
  user: IUser
}

const login = actionCreator.async<{ email: string, password: string },
                                  IUser,
                                  IError>('LOGIN');

const logout = actionCreator.async<{ token: string },
                                   INoResponse,
                                   IError>('LOGOUT');

const loginThunk = () => async (dispatch) => {
  dispatch(login.started({ email: "email@mail.ru", password: "idinahui" }));

  // Mock call, the url/options are irrelevant
  let data = JSON.parse(await fetch("loginurl", { method: "POST" }));

  dispatch(login.done(data));
};

const logoutThunk = () => async (dispatch) => {
  dispatch(logout.started());

  // Again, mock doesn't support logging out, we'd need a conditional there, this is just to keep it waiting
  // NOTE: Potential race condition when two thunks are executed one before the other finishes!!
  let data = JSON.parse(await fetch("logouturl", { method: "POST" }));
  
  dispatch(logout.done());
}

const fetch = (url, params) => Promise.resolve('{ "username": "sukablyat", "token": "123456"}');

/* reducer */
const authReducer = (state, action) : IAuthState => {
  switch(action.type) {
    case login.started.type:
      return Object.assign({}, state);
    case login.done.type:
      return Object.assign({}, state, { user: action.payload });
    case logout.started.type:
      return Object.assign({}, state, { user: undefined });
    case logout.done.type:
      return Object.assign({}, state);
    default:
      return Object.assign({}, state);
  }
}

const logger = createLogger({colors: false});
const store = createStore(authReducer, applyMiddleware(thunk, logger));

store.dispatch(loginThunk());
store.dispatch(logoutThunk());
