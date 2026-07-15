import React, { useState, useRef } from 'react';
import '../styles/dashboard-ultra.css';

const FileUpload = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (newFiles) => {
        const fileArray = Array.from(newFiles).filter(
            file => file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')
        );
        
        if (fileArray.length > 0) {
            setFiles(prev => [...prev, ...fileArray]);
            if (onUpload) {
                onUpload(fileArray);
            }
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="upload-container glass-panel">
            <div className="upload-header">
                <h3><i className="fa-solid fa-cloud-arrow-up"></i> Upload Resumes</h3>
                <p>Drag and drop PDF files or click to browse</p>
            </div>
            
            <div 
                className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="drop-zone-content">
                    <div className="upload-icon-pulse">
                        <i className="fa-solid fa-file-pdf"></i>
                    </div>
                    <h4>Drop files here</h4>
                    <span>or click to browse</span>
                </div>
                <input 
                    type="file" 
                    id="fileInput" 
                    multiple 
                    accept=".pdf,.doc,.docx"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleChange}
                />
            </div>

            {files.length > 0 && (
                <div className="file-list" id="fileList">
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            <i className="fa-solid fa-file-pdf"></i>
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button type="button" className="remove-btn" onClick={() => removeFile(index)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
