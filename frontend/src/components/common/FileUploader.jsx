import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export const FileUploader = ({
  onFileSelect,
  accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  label = 'Drag & drop meal or food photo here, or browse',
  hint = 'Supports JPG, PNG, WEBP (up to 10MB)',
}) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <UploadCloud
          size={42}
          color={isDragActive ? '#FF6B35' : '#9CA3AF'}
          style={{ marginBottom: 12 }}
        />
        <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>
          {isDragActive ? 'Drop the file right here!' : label}
        </p>
        <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{hint}</span>
      </div>

      {preview && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxHeight: 260,
              maxWidth: '100%',
              borderRadius: 12,
              border: '1px solid #2D3140',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUploader;
