import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Election } from '../../types';

interface ElectionDetailsModalProps {
  show: boolean;
  onClose: () => void;
  election: Election | null;
}

const ElectionDetailsModal: React.FC<ElectionDetailsModalProps> = ({ show, onClose, election }) => {
  if (!election) return null;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="custom-backdrop"
      contentClassName="election-modal-content"
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">{election.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <h5 className="text-secondary">Beschreibung:</h5>
          <p>{election.description}</p>
          <h5 className="text-secondary">Blockchain-Id:</h5>
          <p>{election.blockchain_id}</p>
          <h5 className="text-secondary">Startdatum:</h5>
          <p>{election.start_date ? new Date(election.start_date).toLocaleDateString() : 'Unbekannt'}</p>
          <h5 className="text-secondary">Enddatum:</h5>
          <p>{election.end_date ? new Date(election.end_date).toLocaleDateString() : 'Unbekannt'}</p>
          <h5 className="text-secondary">Status:</h5>
          <p>{election.status || 'Unbekannt'}</p>
          <h5 className="text-secondary">Ergebnisse:</h5>
          <p>Die Ergebnisse dieser Wahl sind noch nicht verfügbar.</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Schließen
        </Button>
      </Modal.Footer>
      <style>
        {`
          .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.3) !important;
          }

          .modal-content {
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          }

          .modal-header {
            border-bottom: none;
          }
        `}
      </style>
    </Modal>
  );
};

export default ElectionDetailsModal;
