import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import firebaseConfig from './myFirebaseConfig';

export const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(firebaseConfig)

export const db = app.database()
export const TIMESTAMP = firebase.database.ServerValue.TIMESTAMP
