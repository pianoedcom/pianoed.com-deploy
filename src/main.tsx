import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { injectSecurityMetaTags } from "@/lib/security";
import "./index.css";
import "./styles/article.css";
// Inject CSP and other security meta tags before the app renders.
injectSecurityMetaTags();
createRoot(document.getElementById("root")!).render(<App />);