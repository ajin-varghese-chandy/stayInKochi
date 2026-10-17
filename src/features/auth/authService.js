import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { child, get, ref, set } from 'firebase/database'
import { auth, database } from '../../services/firebase'

// StayInKochi has exactly one owner. That account is created once in the
// Firebase console (owners do not register through the app), and this email in
// .env marks them as the owner. Everyone who registers becomes a tenant.
const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL

// Register a new tenant and save their profile in the realtime database.
export async function registerUser({ email, password, displayName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const firebaseUser = credential.user

  await updateProfile(firebaseUser, { displayName })

  const profile = {
    uid: firebaseUser.uid,
    email,
    displayName,
    role: 'tenant',
    createdAt: new Date().toISOString(),
  }
  await set(ref(database, `users/${firebaseUser.uid}`), profile)

  return profile
}

// Sign in and return the profile for that user.
export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const savedProfile = await loadUserProfile(credential.user.uid)
  return buildProfile(credential.user, savedProfile)
}

export async function logoutUser() {
  await signOut(auth)
}

// Read the saved profile for a user id, or null if none exists yet.
export async function loadUserProfile(uid) {
  const snapshot = await get(child(ref(database, 'users'), uid))
  return snapshot.exists() ? snapshot.val() : null
}

// Run `callback` with the signed-in profile (or null when signed out) whenever
// the Firebase auth state changes. Returns an unsubscribe function.
export function subscribeToAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }

    const savedProfile = await loadUserProfile(firebaseUser.uid)
    callback(buildProfile(firebaseUser, savedProfile))
  })
}

// Turn a Firebase user + their saved profile into the profile the app uses.
// The single owner is recognised by their email; everyone else is a tenant.
function buildProfile(firebaseUser, savedProfile) {
  const profile = savedProfile ?? {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role: 'tenant',
  }

  if (firebaseUser.email === OWNER_EMAIL) {
    profile.role = 'owner'
  }

  return profile
}
