import React, { useState } from 'react';
import axios from 'axios';
import FileDownload from './FileDownload'

const FileSummary: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFile(files[0]);
        }
    };

    const handleUploadAndAnalyze = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            alert('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:3000/api/text-analysis', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data.downloadUrl)
            // Assuming the backend sends a URL for the summarized file
            setDownloadUrl(response.data.downloadUrl); // Set the URL for downloading the summary
            alert('File processed successfully. You can now download the summary.');
            
        } catch (error) {
            alert('There was an error processing your file.');
            console.error(error);
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleUploadAndAnalyze}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload and Summarize</button>
            </form>
            {downloadUrl && (
                <div>
                {<FileDownload downloadUrl={downloadUrl}/>}
                </div>
            )}
        </div>
    );
};

export default FileSummary;