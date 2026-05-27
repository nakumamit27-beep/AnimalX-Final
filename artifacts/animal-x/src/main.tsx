import "./utils/perf"; // ← must be first: captures startup timestamp
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/app.css";
import { listenOverrides } from "./utils/animalOverrides";

listenOverrides();

createRoot(document.getElementById("root")!).render(<App />);
