import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SurveyPage from './pages/SurveyPage/surveyPage';
import StartPage from './pages/StartPage/StartPage';
import React from 'react';
import { ReactFormBuilder } from 'react-form-builder2';
import 'react-form-builder2/dist/app.css';
import './components/FormBuilder/FormBuilder.css';
import './index.css';
import Demobar from './components/Demobar/Demobar';

// Import Login und Register Pages
import LoginPage from './pages/Authentication/Login';
import RegisterGeneral from './pages/Authentication/RegisterGeneral';
import RegisterMRZ from './pages/Authentication/RegisterMRZ';

// Funktion zum Überprüfen, ob ein Benutzer eingeloggt ist
const isAuthenticated = () => {
  return !!localStorage.getItem('jwtToken'); // Gibt true zurück, wenn ein Token vorhanden ist
};

// Higher-Order Component für geschützte Routen
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />; // Leitet zur Login-Seite um, wenn der Benutzer nicht eingeloggt ist
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Standard-Weiterleitung zur Login-Seite */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login-Seite */}
        <Route path="/login" element={<LoginPage />} />

        {/* Registrierungsschritt 1: Allgemeine Daten */}
        <Route path="/register" element={<RegisterGeneral />} />

        {/* Registrierungsschritt 2: MRZ-Daten */}
        <Route path="/register-mrz" element={<RegisterMRZ />} />

        {/* Geschützte Routen */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <StartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createSurvey"
          element={
            <ProtectedRoute>
              <div>
                <ReactFormBuilder url="/api/formdata" saveUrl="/api/formdata" />
                <Demobar />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Weiterleitung unbekannter Routen zur Home-Seite */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
