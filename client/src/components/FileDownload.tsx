import React from 'react';

interface FileDownloadProps {
    downloadUrl: string;
}

const FileDownload: React.FC<FileDownloadProps> = ({ downloadUrl}) => {
    const handleDownload = () => {
        // create the url for download
        const link = document.createElement('a');
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // return a button that as user clicks on it, it will start to download file
    return (
        <div className="container">
            <button onClick={handleDownload}>Download File</button>
        </div>
    );
};

export default FileDownload;
