import React, { useState, useCallback } from 'react';
// interface with a REST API
import axios from 'axios';

// interface used to connect to Fileconvert.tsx
interface FileUploadProps {
    onUploadSuccess: (convertedFileUrl: string) => void;
    onUploadError: (error: string) => void;
}


const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
    // set useState initialize to null
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // if there is file uploaded, change the state
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
};

    // triggered when use click the button to upload file
    const handleFileUpload = useCallback(async () => {
    // if the state shows has file
    if (selectedFile) {
        // FormData constructs a set of key/value pairs representing form fields and their values
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // use axios to perform an HTTP POST request
            const response = await axios.post('http://localhost:3000/api/pdf-to-docx', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // if has reply and has data
            if (response.status === 200 && response.data) {
                // need to be data.data.
                onUploadSuccess(response.data.data.convertedFileUrl);
            } else {
                onUploadError('File conversion was unsuccessful.');
            }
        } catch (error) {
            onUploadError( 'An error occurred during file upload.');
        }
    }
  }, [selectedFile, onUploadSuccess, onUploadError]);

  return (
    <div>
        <input type="file" onChange={handleFileChange} />
        
        <button onClick={handleFileUpload} disabled={!selectedFile}>
            Upload and Convert File
        </button>
    </div>
  );
};

export default FileUpload;

