import React from 'react';
// Import the FileUpload component
import FileUpload from '../components/FileUpload'; 


const FileConverter: React.FC = () => {
    // FileUpload component contains all the logic
    return (
        <div>
            <h2>Convert your PDF to DOCX</h2>
        
            <FileUpload />
        
        </div>
    );
};

export default FileConverter;