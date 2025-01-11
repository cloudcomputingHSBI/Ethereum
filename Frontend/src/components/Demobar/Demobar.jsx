import React from 'react';
import { ReactFormGenerator, ElementStore } from 'react-form-builder2';
import { saveForm } from '../../api/apiService';

export default class Demobar extends React.Component {
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
    };

    this._onUpdate = this._onChange.bind(this);
  }

  componentDidMount() {
    ElementStore.subscribe(state => this._onUpdate(state.data));
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

  onFormSave(formData) {
      saveForm(this.state.formName, this.state.formDescription, formData, this.state.startdate, this.state.enddate, this.state.password)
  }

  render() {
    let modalClass = 'modal';
    if (this.state.previewVisible) {
      modalClass += ' show d-block';
    }

    let shortModalClass = 'modal short-modal';
    if (this.state.shortPreviewVisible) {
      shortModalClass += ' show d-block';
    }

    let roModalClass = 'modal ro-modal';
    if (this.state.roPreviewVisible) {
      roModalClass += ' show d-block';
    }

    let formDetailsClass = 'modal';
    if (this.state.formDetailsVisible) {
      formDetailsClass += ' show d-block';
    }

    return (
      <div className="clearfix" style={{ margin: '10px', width: '70%' }}>
        <h4 className="float-left">
          {this.state.formName ? this.state.formName : ''}
        </h4>
        <button className="btn btn-primary float-right" style={{ marginRight: '10px' }} onClick={this.showPreview.bind(this)}>Preview Form</button>
        {/* <button className="btn btn-default float-right" style={{ marginRight: '10px' }} onClick={this.showShortPreview.bind(this)}>Alternate/Short Form</button> */}
        {/* <button className="btn btn-default float-right" style={{ marginRight: '10px' }} onClick={this.showRoPreview.bind(this)}>Read Only Form</button> */}

        { this.state.previewVisible &&
          <div className={modalClass}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={{}}
                  action_name="Save"
                  form_action="/survey"
                  form_method="POST"
                  variables={this.props.variables}
                  data={this.state.data} // das ist der form selbst
                  onSubmit= {() => {this.onFormSave(this.state.data)}}
                />

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }

        {this.state.formDetailsVisible && (
          <div className={formDetailsClass}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Erstelle eine Wahl</h5>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.formName}
                      onChange={(e) => this.setState({ formName: e.target.value, formNameError: '' })}
                    />
                    {this.state.formNameError && (
                      <div style={{ color: 'red', marginTop: '5px' }}>
                        {this.state.formNameError}
                      </div>
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
                </div>
                <div className="modal-footer">
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

        { this.state.roPreviewVisible &&
          <div className={modalClass} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={{}}
                  action_name="Save"
                  form_action="/survey"
                  form_method="POST"
                  read_only={true}
                  variables={this.props.variables}
                  hide_actions={true} data={this.state.data} />

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }

        { this.state.shortPreviewVisible &&
          <div className={shortModalClass}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action=""
                  answer_data={{}}
                  form_action="/"
                  form_method="POST"
                  data={this.state.data}
                  display_short={true}
                  variables={this.props.variables}
                  hide_actions={false} />

                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.closePreview.bind(this)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}
