import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { SocialProvider } from "./context/SocialContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import FirebaseStatusBanner from "./components/FirebaseStatusBanner";
import Home from "./pages/Home";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import Map from "./pages/Map";
import Reels from "./pages/Reels";
import Travel from "./pages/Travel";
import Chatbot from "./pages/Chatbot";
import HelpDesk from "./pages/HelpDesk";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Ads from "./pages/Ads";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "80px" }}>🔍</div>
      <h2 style={{ fontSize: "24px", marginTop: "16px" }}>Page Not Found</h2>
      <a href="/" style={{ color: "#22c55e", marginTop: "16px", display: "inline-block" }}>← Go Home</a>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash-inner">
        <div className="splash-icon">🐾</div>
        <h1 className="splash-title">Animal X</h1>
        <p className="splash-sub">Wildlife Explorer</p>
        <div className="splash-loader">
          <div className="splash-dot" />
          <div className="splash-dot" />
          <div className="splash-dot" />
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/animals" component={Animals} />
          <Route path="/animals/:id" component={AnimalDetail} />
          <Route path="/map" component={Map} />
          <Route path="/reels" component={Reels} />
          <Route path="/travel" component={Travel} />
          <Route path="/chat" component={Chatbot} />
          <Route path="/help" component={HelpDesk} />
          <Route path="/auth" component={Auth} />
          <Route path="/profile" component={Profile} />
          <Route path="/user/:userId" component={UserProfile} />
          <Route path="/ads" component={Ads} />
          <Route path="/live-tracking" component={Map} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <FirebaseStatusBanner />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocialProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </SocialProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
