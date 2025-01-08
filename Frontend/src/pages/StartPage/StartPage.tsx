import { useNavigate } from 'react-router-dom'

function StartPage() {
  const navigate = useNavigate();
  
  return (
    <h1 onClick={() => navigate('/createSurvey')} style={{ cursor: 'pointer' }}>
      Willkommen auf der Startseite. Klicke hier, um zur Umfrage zu gelangen!
    </h1>
  );
}

export default StartPage;