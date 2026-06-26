import { combineReducers } from '@reduxjs/toolkit';
import rosterReducer from '../features/roster/slices/roster.slice';
import activityReducer from '../features/scheduler/sub-feature/planViewAndSetup/slices/activity.slice';
import { crqJourneyReducer } from '../features/crqJourney';

const rootReducer = combineReducers({
  roster: rosterReducer,
  activity: activityReducer,
   crqJourney: crqJourneyReducer,
});

export default rootReducer;