import React, { useState} from 'react';
// interface with a REST API
import axios from 'axios';
import FileDownload from './FileDownload'


const FileUpload = () => {
    // set useState initialize to null
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [targetLang, setTargetLang] = useState('de');
    const languages = [
        { code: 'de', name: 'German' },
        { code: 'fr', name: 'French' },
        { code: 'EN-US', name: 'English' },
        { code: 'zh', name: 'Chinese (Simplified)' },
        
      ];

    // if there is file uploaded, change the state
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // const [downloadUrl, setDownloadUrl] = useState('');
    // const [showDownloadButton, setShowDownloadButton] = useState(false);

    // triggered when use click the button to upload file
    const handleFileUpload = async () => {
    // if the state shows has file
    if (selectedFile) {
        // FormData constructs a set of key/value pairs representing form fields and their values
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('targetLang', targetLang);

        try {
            // use axios to perform an HTTP POST request
            const response = await axios.post('http://localhost:3000/api/dltranslater', formData,{
                responseType: 'blob', // Important: this tells Axios to handle binary data
              });
            // if has reply and has data, we put the url into the downloadUrl var
            if (response.status === 200 && response.data) {
                // need to be data.data.
                const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
                const fileExtension = selectedFile.name.split('.').pop();
                // change the state to show the button
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `translated_file.${fileExtension}`); // Set a default download file name here
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            } else {
            console.error('File translate was unsuccessful.');
            }
        } catch (error) {
            console.error( 'An error occurred during file upload.');
        }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <select onChange={(e) => setTargetLang(e.target.value)} value={targetLang}>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      <button onClick={handleFileUpload} disabled={!selectedFile}>
        Upload and Translate
      </button>
      {/* Your download link logic here */}
    </div>
  );
};

export default FileUpload;