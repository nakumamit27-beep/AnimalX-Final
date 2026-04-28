import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const SUPER_ADMIN_EMAIL = "malinotaling8@gmail.com";

const DEFAULT_PROFILE = {
  followers: 0,
  following: 0,
  posts: 0,
  reels: 0,
  isVerified: false,
  manualVerified: false,
  autoGrow: false,
};

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [verifiedMap, setVerifiedMap] = useState({});
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    const stored = readJSON("ax_user", null);
    if (stored) setUser(stored);

    const p = readJSON("ax_profile", DEFAULT_PROFILE);
    setProfile({ ...DEFAULT_PROFILE, ...p });

    const v = readJSON("ax_verified_map", {});
    setVerifiedMap(v);

    if (sessionStorage.getItem("ax_admin_mode") === "true") {
      setAdminMode(true);
    }
  }, []);

  // Auto-grow followers on every app start (once per session)
  useEffect(() => {
    if (!profile.autoGrow) return;
    const grew = sessionStorage.getItem("ax_grew_session");
    if (grew) return;
    sessionStorage.setItem("ax_grew_session", "1");
    const bump = 5 + Math.floor(Math.random() * 6); // 5-10
    setProfile((p) => {
      const next = { ...p, followers: (p.followers || 0) + bump };
      localStorage.setItem("ax_profile", JSON.stringify(next));
      return next;
    });
  }, [profile.autoGrow]);

  // Persist profile
  useEffect(() => {
    localStorage.setItem("ax_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("ax_verified_map", JSON.stringify(verifiedMap));
  }, [verifiedMap]);

  const isSuperAdmin = !!(user && user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL);

  // Auto-verify at 100k followers OR manualVerified ON
  const autoVerified = (profile.followers || 0) >= 100000;
  const isVerified = profile.manualVerified || autoVerified;

  function signup(name, email, password) {
    if (!email || !password) {
      alert("Please fill all fields.");
      return false;
    }
    const existing = readJSON("ax_users", []);
    if (existing.find((u) => u.email === email)) {
      alert("Email already registered.");
      return false;
    }
    const uid = `uid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newUser = { uid, name, email, password, createdAt: new Date().toISOString() };
    localStorage.setItem("ax_users", JSON.stringify([...existing, newUser]));
    const session = { uid, name, email };
    localStorage.setItem("ax_user", JSON.stringify(session));
    setUser(session);
    return true;
  }

  function login(email, password) {
    const users = readJSON("ax_users", []);
    const match = users.find((u) => u.email === email && u.password === password);
    if (!match) {
      alert("Invalid email or password.");
      return false;
    }
    const session = { uid: match.uid, name: match.name, email: match.email };
    localStorage.setItem("ax_user", JSON.stringify(session));
    setUser(session);
    return true;
  }

  function logout() {
    localStorage.removeItem("ax_user");
    sessionStorage.removeItem("ax_admin_mode");
    setUser(null);
    setAdminMode(false);
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

  function updateProfile(patch) {
    setProfile((p) => ({ ...p, ...patch }));
  }

  function setVerifiedFor(emailOrUid, value) {
    setVerifiedMap((m) => ({ ...m, [emailOrUid]: !!value }));
  }

  function isUserVerified(u) {
    if (!u) return false;
    if (u.email && verifiedMap[u.email]) return true;
    if (u.uid && verifiedMap[u.uid]) return true;
    if (typeof u.followers === "number" && u.followers >= 100000) return true;
    return false;
  }

  function getAllUsers() {
    return readJSON("ax_users", []);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        adminMode,
        isSuperAdmin,
        isVerified,
        verifiedMap,
        SUPER_ADMIN_EMAIL,
        signup,
        login,
        logout,
        unlockAdminMode,
        lockAdminMode,
        updateProfile,
        setVerifiedFor,
        isUserVerified,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
