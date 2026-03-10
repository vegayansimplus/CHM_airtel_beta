import { combineReducers } from '@reduxjs/toolkit';
import rosterReducer from '../features/roster/slices/roster.slice'; 

const rootReducer = combineReducers({

  roster: rosterReducer, 
});

export default rootReducer;