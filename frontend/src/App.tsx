/**
 * App router (V2 §2.1).
 *
 * Routes:
 *   /             → Home (split-pane dashboard)
 *   /academic     → Academic
 *   /work         → Work (formerly /professional)
 *   /projects     → Projects
 *   /books        → Books / Readings
 *   /hobbies      → Hobbies (formerly /photography)
 *   /certificates → Certificates (technical & professional training)
 *   /api-docs     → API & content-schema documentation
 *
 * Legacy paths /professional, /profiles, and /photography are issued
 * `<Navigate replace>` redirects so external links / bookmarks resolve.
 */

import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Academic } from "./pages/Academic";
import { Work } from "./pages/Work";
import { Projects } from "./pages/Projects";
import { Books } from "./pages/Books";
import { Hobbies } from "./pages/Hobbies";
import { Certificates } from "./pages/Certificates";
import { ApiDocs } from "./pages/ApiDocs";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/work" element={<Work />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/books" element={<Books />} />
        <Route path="/hobbies" element={<Hobbies />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/api-docs" element={<ApiDocs />} />

        {/* Legacy redirects */}
        <Route
          path="/professional"
          element={<Navigate to="/work" replace />}
        />
        <Route path="/profiles" element={<Navigate to="/work" replace />} />
        <Route
          path="/photography"
          element={<Navigate to="/hobbies" replace />}
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
