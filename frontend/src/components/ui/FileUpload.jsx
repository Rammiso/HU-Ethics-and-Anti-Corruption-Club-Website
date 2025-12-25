import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '../../utils/helpers';
import Button from './Button';

const FileUpload = ({
  onFilesChange,
  accept = {},
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  showPreview = true,
  files = []
}) => {
  const [uploadedFiles, setUploadedFiles] = React.useState(files);

  const onDrop = React.useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    const updatedFiles = multiple 
      ? [...uploadedFiles, ...newFiles].slice(0, maxFiles)
      : newFiles.slice(0, 1);

    setUploadedFiles(updatedFiles);
    onFilesChange?.(updatedFiles.map(f => f.file));
  }, [uploadedFiles, multiple, maxFiles, onFilesChange]);

  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange?.(updatedFiles.map(f => f.file));
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled
  });

  React.useEffect(() => {
    return () => {
      // Cleanup preview URLs
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const inputId = 'file-upload';

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          'hover:border-neon-green/50 hover:bg-neon-green/5',
          isDragActive && 'border-neon-green bg-neon-green/10',
          isDragReject && 'border-error-500 bg-error-500/10',
          error && 'border-error-500',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input {...getInputProps()} id={inputId} />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className={cn(
            'w-8 h-8',
            isDragActive ? 'text-neon-green' : 'text-muted-foreground'
          )} />
          
          <div>
            <p className="text-sm font-medium">
              {isDragActive 
                ? 'Drop files here...' 
                : 'Click to upload or drag and drop'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(accept).length > 0 
                ? `Accepted: ${Object.keys(accept).join(', ')}`
                : 'All file types accepted'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
              {multiple && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-error-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{file.name}: {errors[0]?.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* File Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center gap-3 p-3 rounded-lg glass border border-white/10"
              >
                {fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt={fileObj.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    {fileObj.file.type.startsWith('image/') ? (
                      <Image className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <File className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileObj.file.size)}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(fileObj.id)}
                  className="text-error-500 hover:text-error-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-error-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FileUpload;