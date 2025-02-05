import React from 'react';
import { ReactFormGenerator, ElementStore } from 'react-form-builder2';
import { saveForm } from '../../api/apiService';
import { getUsers } from '../../api/apiService';
import styles from './Demobar.module.css';

class Demobar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
      formDetailsVisible: true,
      formName: '',
      formDescription: '',
      password: '',
      startdate: '',
      enddate: '',
      isProtected: false,
      formNameError: '',
      isSaving: false,
      accessType: 'open',
      allowedUsers: [],
    };

    this._onUpdate = this._onChange.bind(this);
  }

  handleUserSelection(userId) {
    this.setState((prevState) => {
      const { allowedUsers } = prevState;
      return {
        allowedUsers: allowedUsers.includes(userId)
          ? allowedUsers.filter((id) => id !== userId)
          : [...allowedUsers, userId],
      };
    });
  }

  async loadUsers() {
    try {
      const users = await getUsers();
      this.setState({ users });
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  }

  componentDidMount() {
    this.loadUsers();
    ElementStore.subscribe((state) => this._onUpdate(state.data));
  }

  resetForm() {
    // Setzt das Formular und den FormGenerator zurück
    this.setState({
      data: [],
      formName: '',
      formDescription: '',
      password: '',
      startdate: '',
      enddate: '',
      isProtected: false,
      formNameError: '',
    });

    // FormGenerator-Daten zurücksetzen
    ElementStore.dispatch('update', []);
  }

  async onFormSave(formData) {
    try {
      if (this.state.isSaving) return;
      this.setState({ isSaving: true });

      const radioButtons = formData.filter((item) => item.element === 'RadioButtons');
      switch (radioButtons.length) {
        case 0:
          alert('Es muss mindestens eine Umfrage mit einem einzigen Multiple-Choice-Feld erstellt werden!');
          this.setState({ isSaving: false });
          this.closePreview();
          return;
        case 1:
          if (radioButtons[0].options.length < 2) {
            alert('Es müssen mindestens zwei Antwortmöglichkeiten für das Multiple-Choice-Feld erstellt werden!');
            this.setState({ isSaving: false });
            this.closePreview();
            return;
          }
          break;
        default:
          alert('Es darf nur eine Umfrage mit einem einzigen Multiple-Choice-Feld erstellt werden!');
          this.setState({ isSaving: false });
          this.closePreview();
          return;
      }

      await saveForm(
        this.state.formName,
        this.state.formDescription,
        formData,
        this.state.startdate,
        this.state.enddate,
        this.state.accessType,
        this.state.accessType === 'restricted' ? this.state.allowedUsers : []
      );

      alert('Wahl erfolgreich gespeichert!');
      this.resetForm(); // Formular und FormGenerator zurücksetzen
      this.props.navigate('/home'); // Navigation zur Startseite
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Wahl!');
    } finally {
      this.setState({ isSaving: false });
    }
  }

  showPreview() {
    this.setState({
      previewVisible: true,
    });
  }

  showShortPreview() {
    this.setState({
      shortPreviewVisible: true,
    });
  }

  showFormDetails() {
    this.setState({
      formDetailsVisible: true,
    });
  }

  closeFormDetails() {
    this.setState({
      formDetailsVisible: false,
    });
  }

  handleFormDetailsSubmit() {
    if (!this.state.formName.trim()) {
      this.setState({ formNameError: 'Name ist erforderlich!' });
      return;
    }

    this.closeFormDetails();
  }

  showRoPreview() {
    this.setState({
      roPreviewVisible: true,
    });
  }

  closePreview() {
    this.setState({
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
    });
  }

  _onChange(data) {
    this.setState({
      data,
    });
  }

  render() {
    let modalClass = 'modal';
    if (this.state.previewVisible) {
      modalClass += ' show d-block';
    }

    let formDetailsClass = 'modal';
    if (this.state.formDetailsVisible) {
      formDetailsClass += ' show d-block';
    }

    return (
      <div className="clearfix" style={{ margin: '10px', width: '70%' }}>
        <h4 className="float-left">{this.state.formName ? this.state.formName : ''}</h4>
        <button
          className="btn btn-primary float-right"
          style={{ marginRight: '10px' }}
          onClick={this.showPreview.bind(this)}
        >
          Preview Form
        </button>

        {this.state.previewVisible && (
          <div className={modalClass}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={{}}
                  action_name="Save"
                  form_action=""
                  form_method=""
                  variables={this.props.variables}
                  data={this.state.data}
                  onSubmit={() => {
                    this.onFormSave(this.state.data);
                  }}
                />
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    onClick={this.closePreview.bind(this)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {this.state.formDetailsVisible && (
          <div className={formDetailsClass}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Erstelle eine Wahl</h5>
                </div>
                <div className="modal-body">
                  <p className="text-muted">
                    Geben Sie zunächst die Eckdaten der Wahl (Name, Beschreibung, Startdatum und Enddatum) ein. Falls
                    die Wahl geschützt werden soll, aktivieren Sie die Checkbox und vergeben ein Passwort. Im nächsten
                    Schritt können Sie mit dem Formbuilder die Wahlstruktur erstellen und anschließend in der Vorschau
                    überprüfen. Speichern Sie die Wahl über die Schaltfläche "Preview -{'>'} Save".
                  </p>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.formName}
                      onChange={(e) => this.setState({ formName: e.target.value, formNameError: '' })}
                    />
                    {this.state.formNameError && (
                      <div style={{ color: 'red', marginTop: '5px' }}>{this.state.formNameError}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Beschreibung</label>
                    <textarea
                      className="form-control"
                      value={this.state.formDescription}
                      onChange={(e) => this.setState({ formDescription: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Startdatum</label>
                    <input
                      type="date"
                      className="form-control"
                      value={this.state.startdate}
                      onChange={(e) => this.setState({ startdate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Enddatum</label>
                    <input
                      type="date"
                      className="form-control"
                      value={this.state.enddate}
                      onChange={(e) => this.setState({ enddate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Zugriffsart</label>
                    <select className="form-control" value={this.state.accessType} onChange={(e) => this.setState({ accessType: e.target.value })}>
                      <option value="open">Offen (alle Nutzer)</option>
                      <option value="restricted">Eingeschränkt (nur ausgewählte Nutzer)</option>
                    </select>
                  </div>
                  {this.state.accessType === 'restricted' && (
                    <div className="form-group">
                      <label>Berechtigte Nutzer:</label>
                      <ul className="list-group">
                        {this.state.users.map((user) => (
                          <li key={user.user_id} 
                              className={`list-group-item ${this.state.allowedUsers?.includes(user.user_id) ? 'active' : ''}`} 
                              onClick={() => this.handleUserSelection(user.user_id)}
                              style={{ cursor: 'pointer' }}>
                            {user.name} ({user.email})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => this.props.navigate('/home')} // Navigation zu Home
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleFormDetailsSubmit.bind(this)}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Demobar;
