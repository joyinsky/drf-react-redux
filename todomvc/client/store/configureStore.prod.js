import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import { apiMiddleware } from 'redux-api-middleware';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, applyMiddleware(promise, apiMiddleware));
}
