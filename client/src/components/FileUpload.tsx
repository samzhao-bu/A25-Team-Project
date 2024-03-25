import React, { useState} from 'react';
// interface with a REST API
import axios from 'axios';
import FileDownload from './FileDownload'

const FileUpload = () => {
    // set useState initialize to null
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // if there is file uploaded, change the state
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const [downloadUrl, setDownloadUrl] = useState('');
    const [showDownloadButton, setShowDownloadButton] = useState(false);

    // triggered when use click the button to upload file
    const handleFileUpload = async () => {
    // if the state shows has file
    if (selectedFile) {
        // FormData constructs a set of key/value pairs representing form fields and their values
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // use axios to perform an HTTP POST request
            const response = await axios.post('http://localhost:3000/api/pdf-to-docx', formData,);
            // if has reply and has data, we put the url into the downloadUrl var
            if (response.status === 200 && response.data) {
                // need to be data.data.
                setDownloadUrl(response.data.data.convertedFileUrl);
                // change the state to show the button
                setShowDownloadButton(true);
                alert(`${response.data.message}`);
            } else {
            console.error('File conversion was unsuccessful.');
            }
        } catch (error) {
            console.error( 'An error occurred during file upload.');
        }
    }
  };

  return (
    <div className="container">
        <input type="file" onChange={handleFileChange} />
        
        <button onClick={handleFileUpload} disabled={!selectedFile}>
            Upload File
        </button>

        {showDownloadButton && (
                <FileDownload downloadUrl={downloadUrl}/>
            )}
    </div>
  );
};

export default FileUpload;

