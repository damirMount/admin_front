// contexts/AppContext.js

import React, {createContext, useContext, useReducer} from 'react';

const AppContext = createContext();
const initialState = {
    alert: {type: '', text: ''},
    modal: {isOpen: false},
    AppContext: null,
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'RESET_STATE':
            return initialState;
        case 'SET_ALERT':
            return {...state, alert: action.payload};
        case 'SET_MODAL':
            return {...state, modal: action.payload};
        case 'SET_APP_CONTEXT':
            return {...state, AppContext: action.payload};
        default:
            return state;
    }
};

const AppProvider = ({children}) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const resetState = () => {
        dispatch({type: 'RESET_STATE'});
    };

    const setAlert = (type, text) => {
        dispatch({type: 'SET_ALERT', payload: {type, text}});
    };

    const setModal = (isOpen) => {
        dispatch({type: 'SET_MODAL', payload: {isOpen}});
    };

    const setAppContext = (context) => {
        dispatch({type: 'SET_APP_CONTEXT', payload: context});
    };

    return (
        <AppContext.Provider value={{state, resetState, setAlert, setModal, setAppContext}}>
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => {
    const context = useContext(AppContext);

    if (!context || !context.state.AppContext) {
        throw new Error('useAppContext must be used within an AppProvider');
    }

    return context;
};

export {AppProvider, useAppContext, AppContext};
