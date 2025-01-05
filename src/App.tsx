// import $ from "jquery";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import SurveyPage from './pages/SurveyPage/surveyPage';
import StartPage from './pages/StartPage/StartPage';
import React from 'react'
import ReactDOM from 'react-dom'


// Form builder
import DemoBar from './demobar';
import { ReactFormBuilder } from 'react-form-builder2'
import 'react-form-builder2/dist/app.css'
// import './components/FormBuilder/FormBuilder.css'
// window.jQuery = $;




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/" element={
          <div>
            
            <ReactFormBuilder 
            url='/api/formdata'
            saveUrl='/api/formdata'
            />
            <DemoBar />
          </div> }
        />
        <Route path="/home" element={<StartPage />} />
      </Routes>
    </Router>
  )
}

export default App

// guck dir das hier an

// https://www.npmjs.com/package/react-form-builder2