import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { child, get, ref, set } from 'firebase/database'
import { auth, database } from '../../services/firebase'

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL
const CACHE_KEY = 'stayinkochi.auth.user'

export function readCachedUser() {
  try {
    const savedText = window.sessionStorage.getItem(CACHE_KEY)
    return savedText ? JSON.parse(savedText) : null
  } catch {
    return null
  }
}

export function cacheUser(user) {
  try {
    if (user) {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(user))
    } else {
      window.sessionStorage.removeItem(CACHE_KEY)
    }
  } catch {
    // Storage is not available
  }
}

export async function registerUser({ email, password, displayName }) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  const firebaseUser = result.user

  await updateProfile(firebaseUser, { displayName })

  const profile = {
    uid: firebaseUser.uid,
    email: email,
    displayName: displayName,
    role: 'tenant',
    createdAt: new Date().toISOString(),
  }

  await set(ref(database, `users/${firebaseUser.uid}`), profile)
  cacheUser(profile)

  return profile
}

export async function loginUser({ email, password }) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  const savedProfile = await loadProfileOrNull(result.user.uid)
  const profile = buildProfile(result.user, savedProfile)

  cacheUser(profile)

  return profile
}

export async function logoutUser() {
  await signOut(auth)
  cacheUser(null)
}

export async function loadUserProfile(uid) {
  const snapshot = await get(child(ref(database, 'users'), uid))
  return snapshot.exists() ? snapshot.val() : null
}

async function loadProfileOrNull(uid) {
  try {
    return await loadUserProfile(uid)
  } catch (error) {
    console.error('Could not load the saved user profile:', error)
    return null
  }
}

export function subscribeToAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }

    const savedProfile = await loadProfileOrNull(firebaseUser.uid)
    callback(buildProfile(firebaseUser, savedProfile))
  })
}

function buildProfile(firebaseUser, savedProfile) {
  let profile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role: 'tenant',
  }

  if (savedProfile) {
    profile = { ...savedProfile }
  }

  if (firebaseUser.email === OWNER_EMAIL) {
    profile.role = 'owner'
  }

  return profile
}
