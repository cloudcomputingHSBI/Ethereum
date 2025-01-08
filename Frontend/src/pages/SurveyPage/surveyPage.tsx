import { useState } from 'react';
import styles from './surveyPage.module.css';

function SurveyPage() {
  // Zustände für das Formular
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allowComments, setAllowComments] = useState(false);

  // Funktionen zum Hinzufügen von Optionen
  const addOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier könntest du die Formular-Daten weiterverarbeiten oder absenden
    alert('Umfrage gespeichert');
  };

  return (
    <div className={`container mt-4 ${styles.surveyPage}`}>
      <h1 className="mb-4">Erstelle eine Umfrage</h1>

      <form onSubmit={handleSubmit}>
        {/* Frage */}
        <div className="mb-3">
          <label htmlFor="question" className="form-label">
            Frage:
          </label>
          <input
            id="question"
            type="text"
            className="form-control"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        {/* Optionen */}
        <div className="mb-3">
          <label className="form-label">Optionen:</label>
          {options.map((option, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addOption}
          >
            Weitere Option hinzufügen
          </button>
        </div>

        {/* Start- und Enddatum */}
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">
            Startdatum:
          </label>
          <input
            id="startDate"
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">
            Enddatum:
          </label>
          <input
            id="endDate"
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Erweiterte Einstellungen */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Erweiterte Einstellungen {showAdvanced ? 'verbergen' : 'anzeigen'}
          </button>
          {showAdvanced && (
            <div className="mt-3">
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                  />
                  Kommentare zulassen
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Absenden */}
        <button type="submit" className="btn btn-primary">
          Umfrage speichern
        </button>
      </form>
    </div>
  );
}

export default SurveyPage;
