import { useState, useEffect, lazy, Suspense, startTransition } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { SocialProvider } from "./context/SocialContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import FirebaseStatusBanner from "./components/FirebaseStatusBanner";

// Lazy load every page — each becomes its own JS chunk, loaded only when visited
const Home        = lazy(() => import("./pages/Home"));
const Animals     = lazy(() => import("./pages/Animals"));
const AnimalDetail = lazy(() => import("./pages/AnimalDetail"));
const Map         = lazy(() => import("./pages/Map"));
const Reels       = lazy(() => import("./pages/Reels"));
const Travel      = lazy(() => import("./pages/Travel"));
const Chatbot     = lazy(() => import("./pages/Chatbot"));
const HelpDesk    = lazy(() => import("./pages/HelpDesk"));
const Auth        = lazy(() => import("./pages/Auth"));
const Profile     = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Ads         = lazy(() => import("./pages/Ads"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return <div className="page-loading">Loading</div>;
}

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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </main>
      <FirebaseStatusBanner />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reduced from 1500ms → 400ms splash
    const timer = setTimeout(() => {
      startTransition(() => setLoading(false));
    }, 400);
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
