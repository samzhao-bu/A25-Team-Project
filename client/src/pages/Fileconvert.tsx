import React from 'react';
import FileUpload from '../components/FileUpload'; // Import the FileUpload component

const FileConverter: React.FC = () => {

  const handleUploadSuccess = (convertedFileUrl: string) => {
    console.log('Converted file URL:', convertedFileUrl);
    alert('File converted successfully!');
    // Here you can set the state or perform other actions with the converted file URL
  };

  const handleUploadError = (error: string) => {
    console.error('Error uploading file:', error);
    alert(error);
  };

  return (
    <div>
      <h2>Convert your PDF to DOCX</h2>
      <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
      {/* You can add additional UI elements or information here */}
    </div>
  );
};

export default FileConverter;