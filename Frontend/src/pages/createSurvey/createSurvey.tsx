import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFormBuilder } from 'react-form-builder2';
import 'react-form-builder2/dist/app.css';
import '../../components/FormBuilder/FormBuilder.css'; // ggf. Pfad anpassen
import Demobar from '../../components/Demobar/Demobar'; // ggf. Pfad anpassen

const CreateSurvey = () => {
  const navigate = useNavigate(); // Verwende den useNavigate-Hook

  useEffect(() => {
    const itemsToHide = [
      'Tags',
      'Text Input',
      'Number Input',
      'Phone Number',
      'Multie-line Ipnut',
      'Fieldset',
      'Image',
      'Email',
      'Fieldset',
      'Signature',
      'File Attachment',
      'Camera',
      'File Upload',
      'Website',
      'Two Column Row',
      'Three Columns Row',
      'Six Columns Row',
      'Five Columns Row',
      'Four Columns Row',
      'Rating',
      'Dropdown',
      'Checkboxes',
      'Multi-line Input',
      'Date',
      'Range',
    ];

    const toolbar = document.querySelector('.react-form-builder-toolbar');
    if (toolbar) {
      Array.from(toolbar.querySelectorAll('li')).forEach((item) => {
        const text = item.textContent || '';
        if (itemsToHide.some((hideItem) => text.includes(hideItem))) {
          item.style.display = 'none';
        }
      });
    }
  }, []);

  return (
    <div>
      <ReactFormBuilder  />
      {/* Übergabe der navigate-Funktion an Demobar */}
      <Demobar navigate={navigate} />
    </div>
  );
};

export default CreateSurvey;
