/**
 * App router — six spec routes plus a 404 fallback.
 *
 * Spec §2.3:
 *   /             → Home (split-pane dashboard)
 *   /academic     → Academic
 *   /professional → Professional (Profiles)
 *   /projects     → Projects
 *   /books        → Books / Readings
 *   /photography  → Photography
 */

import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Academic } from "./pages/Academic";
import { Professional } from "./pages/Professional";
import { Projects } from "./pages/Projects";
import { Books } from "./pages/Books";
import { Photography } from "./pages/Photography";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/professional" element={<Professional />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/books" element={<Books />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
