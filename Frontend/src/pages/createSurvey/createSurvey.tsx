import React, { useEffect } from 'react';
import { ReactFormBuilder } from 'react-form-builder2';
import 'react-form-builder2/dist/app.css';
import '../../components/FormBuilder/FormBuilder.css'; // ggf. Pfad anpassen
import Demobar from '../../components/Demobar/Demobar'; // ggf. Pfad anpassen



const CreateSurvey = () => {
  useEffect(() => {
      // Liste von Elementen, die ausgeblendet werden sollen
      const itemsToHide = [
        'Tags', 
        'Text Input', 
        'Number Input',
        'Phone Number',
        'Multie-line Ipnut',
        'Fieldset',
        'Image', 
        'Email', 'Fieldset', 
        'Signature', 
        'File Attachment', 
        'Camera', 
        'File Upload',  
        'Website',
        'Six Columns Row',
        'Five Columns Row',
        'Four Columns Row',
      ];
  
      // Warte, bis die Toolbar gerendert wurde
      const toolbar = document.querySelector('.react-form-builder-toolbar'); // Selektiere die Toolbar
    
      if (toolbar) {
        // Gehe durch alle <li>-Elemente und blende die aus, die in der Liste sind
        Array.from(toolbar.querySelectorAll('li')).forEach((item) => {
          const text = item.textContent || '';
          if (itemsToHide.some((hideItem) => text.includes(hideItem))) { // Prüfe, ob der Text mit einem der Items in der Liste übereinstimmt
            item.style.display = 'none'; // Blende das Element aus
          }
        });
      }
    }, []);

  return (
    <div>
      <ReactFormBuilder 
        url="/api/formdata" 
        saveUrl="/api/formdata" 
      />
      <Demobar />
    </div>
  );
};

export default CreateSurvey;
