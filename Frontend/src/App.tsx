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

        {/* Startseite */}
        <Route path="/home" element={<StartPage />} />

        {/* Survey-Seite */}
        <Route path="/survey" element={<SurveyPage />} />

        {/* Seite zum Erstellen von Surveys */}
        <Route
          path="/createSurvey"
          element={
            <div>
              <ReactFormBuilder url="/api/formdata" saveUrl="/api/formdata" />
              <Demobar />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
