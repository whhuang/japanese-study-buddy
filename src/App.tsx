import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import VocabularyListPage from './pages/VocabularyListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> {/* Layout wraps child routes */}
        <Route index element={<HomePage />} /> {/* Default page for "/" */}
        <Route path="vocabulary" element={<VocabularyListPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;