import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [tasks, setTasks] = useState({ puzzle: false, visit: false, share: false });

  useEffect(() => {
    const stored = localStorage.getItem("ax_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    if (localStorage.getItem("ax_premium") === "true") {
      setIsPremium(true);
    }
    const storedTasks = localStorage.getItem("ax_tasks");
    if (storedTasks) {
      try { setTasks(JSON.parse(storedTasks)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (tasks.puzzle && tasks.visit && tasks.share) {
      localStorage.setItem("ax_premium", "true");
      setIsPremium(true);
    }
    localStorage.setItem("ax_tasks", JSON.stringify(tasks));
  }, [tasks]);

  function signup(name, email, password) {
    if (!email || !password) { alert("Please fill all fields."); return false; }
    const existing = JSON.parse(localStorage.getItem("ax_users") || "[]");
    if (existing.find(u => u.email === email)) { alert("Email already registered."); return false; }
    const newUser = { name, email, password, createdAt: new Date().toISOString() };
    localStorage.setItem("ax_users", JSON.stringify([...existing, newUser]));
    localStorage.setItem("ax_user", JSON.stringify({ name, email }));
    setUser({ name, email });
    return true;
  }

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem("ax_users") || "[]");
    const match = users.find(u => u.email === email && u.password === password);
    if (!match) { alert("Invalid email or password."); return false; }
    localStorage.setItem("ax_user", JSON.stringify({ name: match.name, email: match.email }));
    setUser({ name: match.name, email: match.email });
    return true;
  }

  function logout() {
    localStorage.removeItem("ax_user");
    setUser(null);
  }

  function unlockPremium() {
    localStorage.setItem("ax_premium", "true");
    setIsPremium(true);
  }

  function completeTask(taskName) {
    setTasks(prev => ({ ...prev, [taskName]: true }));
  }

  return (
    <AuthContext.Provider value={{ user, isPremium, tasks, signup, login, logout, unlockPremium, completeTask }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
