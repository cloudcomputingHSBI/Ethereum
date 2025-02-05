// import React, { useEffect, useState } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import { Election, User } from '../../types';
// import { getUsers } from '../../api/apiService';

// interface ElectionDetailsModalProps {
//   show: boolean;
//   onClose: () => void;
//   election: Election | null;
// }

// const ElectionDetailsModal: React.FC<ElectionDetailsModalProps> = ({ show, onClose, election }) => {
//   const [accessType, setAccessType] = useState<'open' | 'restricted'>('open');
//   const [users, setUsers] = useState<User[]>([]);
//   const [allowedUsers, setAllowedUsers] = useState<number[]>([]);

//   // Lade Benutzer & setze Wahl-Zugangsdaten, wenn die Modal geöffnet wird
//   useEffect(() => {
//     if (show && election) {
//       setAccessType(election.access_type);
//       setAllowedUsers(election.allowedUsers || []);
//       loadUsers();
//     }
//   }, [show, election]);

//   async function loadUsers() {
//     try {
//       const fetchedUsers = await getUsers();
//       setUsers(fetchedUsers);
//     } catch (error) {
//       console.error('Fehler beim Laden der Benutzer:', error);
//     }
//   }

//   return (
//     <Modal show={show} onHide={onClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title className="text-primary">{election?.name}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <h5 className="text-secondary">Beschreibung:</h5>
//         <p>{election?.description}</p>

//         <h5 className="text-secondary">Blockchain-Id:</h5>
//         <p>{election?.blockchain_id}</p>

//         <h5 className="text-secondary">Startdatum:</h5>
//         <p>{election?.start_date ? new Date(election.start_date).toLocaleDateString() : 'Unbekannt'}</p>

//         <h5 className="text-secondary">Enddatum:</h5>
//         <p>{election?.end_date ? new Date(election.end_date).toLocaleDateString() : 'Unbekannt'}</p>

//         <h5 className="text-secondary">Zugriffsart:</h5>
//         <Form.Control as="select" value={accessType} disabled>
//           <option value="open">Offen (alle Nutzer)</option>
//           <option value="restricted">Eingeschränkt (nur ausgewählte Nutzer)</option>
//         </Form.Control>

//         {accessType === 'restricted' && (
//           <div className="form-group mt-3">
//             <label>Berechtigte Nutzer:</label>
//             <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
//               {users.map((user) => (
//                 <div key={user.user_id} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={allowedUsers.includes(user.user_id)}
//                     disabled // Keine Bearbeitung, nur Anzeige
//                   />
//                   <label className="form-check-label">
//                     {user.name} ({user.email})
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose}>
//           Schließen
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default ElectionDetailsModal;
