// src/App.tsx
import { Routes, Route } from 'react-router-dom';

// Import your layout component
import Layout from './components/layout/Layout'; // Or wherever your main layout is

// Import your page components
import HomePage from './pages/HomePage';
import VocabularyListPage from './pages/VocabularyListPage';
import SettingsPage from './pages/SettingsPage';
import FlashcardPage from './pages/FlashcardPage';
import ThemePreviewPage from './pages/ThemePreviewPage';
import EditTablePage from './pages/EditTablePage';

function App() {
  return (
    <Routes>
      {/* Route for the Homepage - Renders HomePage WITHOUT the main Layout */}
      <Route path="/" element={<HomePage />} />

      {/* Route that defines the main Layout for other pages */}
      {/* All nested routes below will render inside Layout's <Outlet /> */}
      <Route element={<Layout />}> {/* Use element prop for layout-only route */}
        <Route path="vocabulary" element={<VocabularyListPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="flashcard" element={<FlashcardPage />} />
        <Route path="edit-table" element={<EditTablePage />} />

        {import.meta.env.DEV && (
          <Route path="/theme-preview" element={<ThemePreviewPage />} />
        )}
      </Route>

      {/* Optional: Catch-all 404 */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;