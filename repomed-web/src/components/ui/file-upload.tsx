'use client';
import { useState, useCallback, DragEvent } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface FileItem {
  file: File;
  id: string;
  preview?: string;
}

export function FileUpload({
  onFilesSelect,
  accept = '*/*',
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  children
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `Arquivo muito grande. Máximo ${formatFileSize(maxSize)}.`;
    }
    
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        return `Tipo de arquivo não aceito. Aceitos: ${accept}`;
      }
    }
    
    return null;
  };

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    const newFiles: FileItem[] = [];
    const fileArray = Array.from(fileList);
    
    // Check total files limit
    if (!multiple && fileArray.length > 1) {
      setError('Apenas um arquivo é permitido.');
      return;
    }
    
    if (files.length + fileArray.length > maxFiles) {
      setError(`Máximo ${maxFiles} arquivos permitidos.`);
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const fileItem: FileItem = {
        file,
        id: Math.random().toString(36).substring(2, 15)
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        try {
          const preview = await createImagePreview(file);
          fileItem.preview = preview;
        } catch (error) {
          console.error('Error creating preview:', error);
        }
      }

      newFiles.push(fileItem);
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onFilesSelect(updatedFiles.map(f => f.file));
  }, [files, multiple, maxFiles, onFilesSelect]);

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesSelect(updatedFiles.map(f => f.file));
  };

  const clearAllFiles = () => {
    setFiles([]);
    onFilesSelect([]);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors',
          dragOver && !disabled 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.onchange = (e) => handleFileInputChange(e as any);
            input.click();
          }
        }}
      >
        {children || (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-aaa-secondary)' }} />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-sm" style={{ color: 'var(--text-aaa-secondary)' }}>
              {accept !== '*/*' && `Tipos aceitos: ${accept}`}
              {maxSize && ` • Tamanho máximo: ${formatFileSize(maxSize)}`}
              {maxFiles > 1 && ` • Máximo ${maxFiles} arquivos`}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">
              Arquivos selecionados ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFiles}
              className="text-red-600 hover:text-red-700"
            >
              Limpar todos
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map((fileItem) => {
              const IconComponent = getFileIcon(fileItem.file);
              return (
                <div key={fileItem.id} className="flex items-center gap-3 p-2 border rounded">
                  {fileItem.preview ? (
                    <img 
                      src={fileItem.preview} 
                      alt={fileItem.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <IconComponent className="h-10 w-10" style={{ color: 'var(--text-aaa-secondary)' }} />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-aaa-secondary)' }}>
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileItem.id);
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}