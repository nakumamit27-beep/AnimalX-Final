import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../utils/firebase";

const AuthContext = createContext(null);

const SUPER_ADMIN_EMAIL = "malinotaling8@gmail.com";

const DEFAULT_PROFILE = {
  followers: 0,
  following: 0,
  posts: 0,
  reels: 0,
  manualVerified: false,
  autoGrow: false,
  bio: "",
  country: "",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [adminMode, setAdminMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email.split("@")[0],
        };
        setUser(u);
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          if (snap.exists()) {
            setProfile({ ...DEFAULT_PROFILE, ...snap.data() });
          } else {
            const fresh = {
              ...DEFAULT_PROFILE,
              name: u.name,
              email: u.email,
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", fbUser.uid), fresh);
            setProfile(fresh);
          }
        } catch {
          setProfile(DEFAULT_PROFILE);
        }
        if (sessionStorage.getItem("ax_admin_mode") === "true") setAdminMode(true);
      } else {
        setUser(null);
        setProfile(DEFAULT_PROFILE);
        setAdminMode(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const isSuperAdmin = !!(user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL);
  const autoVerified = (profile.followers || 0) >= 100000;
  const isVerified = !!(profile.manualVerified || autoVerified);

  async function signup(name, email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(cred.user, { displayName: name });
      return true;
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use" ? "An account with this email already exists." :
        err.code === "auth/weak-password" ? "Password must be at least 6 characters." :
        err.message || "Signup failed.";
      alert(msg);
      return false;
    }
  }

  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? "Incorrect email or password." :
        err.code === "auth/too-many-requests" ? "Too many failed attempts. Please try again later." :
        err.message || "Login failed.";
      alert(msg);
      return false;
    }
  }

  async function logout() {
    await signOut(auth);
    sessionStorage.removeItem("ax_admin_mode");
    setAdminMode(false);
  }

  async function forgotPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateProfile(patch) {
  const newName = patch.name || patch.displayName || patch.username;

  // 1. Firebase Auth ke core user ko update karein
  if (auth.currentUser && newName) {
    try {
      await fbUpdateProfile(auth.currentUser, {
        displayName: newName,
      });
    } catch (e) {
      console.error("Auth displayName update error:", e);
    }
  }

  // 2. Local states turant update karein
  setProfile((p) => ({ ...p, ...patch, name: newName || p.name }));
  setUser((u) => (u ? { ...u, name: newName || u.name, displayName: newName || u.displayName } : u));

  // 3. Firestore database me teeno fields sync karein
  if (user?.uid || auth.currentUser?.uid) {
    const uid = user?.uid || auth.currentUser?.uid;
    const firestoreData = {
      ...patch,
      ...(newName ? { name: newName, displayName: newName, username: newName } : {}),
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(doc(db, "users", uid), firestoreData);
    } catch {
      try {
        await setDoc(doc(db, "users", uid), firestoreData, { merge: true });
      } catch {}
    }
  }
}

  function unlockAdminMode() {
    if (!isSuperAdmin) {
      alert("Admin mode is restricted to the super admin account.");
      return false;
    }
    sessionStorage.setItem("ax_admin_mode", "true");
    setAdminMode(true);
    return true;
  }

  function lockAdminMode() {
    sessionStorage.removeItem("ax_admin_mode");
    setAdminMode(false);
  }

  function toggleAdminMode() {
    const next = !adminMode;
    setAdminMode(next);
    if (next) sessionStorage.setItem("ax_admin_mode", "true");
    else sessionStorage.removeItem("ax_admin_mode");
  }

  const verifiedMap = {};
  function setVerifiedFor() {}
  function isUserVerified(u) {
    if (!u) return false;
    return (u.followers || 0) >= 100000;
  }
  function getAllUsers() { return []; }

  return (
    <AuthContext.Provider value={{
      user, profile, authLoading, isVerified, isSuperAdmin,
      adminMode, setAdminMode, toggleAdminMode,
      unlockAdminMode, lockAdminMode,
      signup, login, logout, forgotPassword, updateProfile,
      setVerifiedFor, isUserVerified, getAllUsers,
      verifiedMap, SUPER_ADMIN_EMAIL,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
