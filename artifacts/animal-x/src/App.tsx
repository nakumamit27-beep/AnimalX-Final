import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import Map from "./pages/Map";
import Reels from "./pages/Reels";
import Travel from "./pages/Travel";
import Chatbot from "./pages/Chatbot";
import HelpDesk from "./pages/HelpDesk";
import Auth from "./pages/Auth";
import Premium from "./pages/Premium";

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
          <Route path="/premium" component={Premium} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
