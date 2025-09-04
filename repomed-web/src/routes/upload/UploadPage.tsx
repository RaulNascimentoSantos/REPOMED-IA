import * as React from 'react';
import { Button } from '../../components/ui/Button';

export default function UploadPage(){
  const [file,setFile]=React.useState<File|null>(null);
  const [progress,setP]=React.useState(0);
  const [res,setRes]=React.useState<any>(null);
  const [isDragging,setDragging]=React.useState(false);
  
  const onUpload=()=>{
    if(!file) return;
    setP(0);
    const form=new FormData();
    form.append('file',file);
    
    const API=import.meta.env.VITE_API_BASE||'http://localhost:8081';
    const xhr=new XMLHttpRequest();
    
    xhr.open('POST',`${API}/api/upload`);
    const token = localStorage.getItem('token');
    if(token) xhr.setRequestHeader('Authorization',`Bearer ${token}`);
    
    xhr.upload.onprogress=e=>{
      if(e.lengthComputable) setP(Math.round(e.loaded/e.total*100));
    };
    xhr.onload=()=>setRes(xhr.status<300?JSON.parse(xhr.responseText):{error:true,detail:xhr.responseText});
    xhr.onerror=()=>setRes({error:true,detail:'Falha no envio'});
    xhr.send(form);
  };
  
  const handleDrop=(e:React.DragEvent)=>{
    e.preventDefault();
    setDragging(false);
    const files=e.dataTransfer.files;
    if(files.length>0) setFile(files[0]);
  };
  
  const handleDragOver=(e:React.DragEvent)=>{
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave=()=>setDragging(false);
  
  const validateFile=(f:File)=>{
    const maxSize=10*1024*1024; // 10MB
    const allowedTypes=['image/jpeg','image/png','application/pdf','text/plain'];
    
    if(f.size>maxSize){
      setRes({error:true,detail:'Arquivo muito grande (máx: 10MB)'});
      return false;
    }
    
    if(!allowedTypes.includes(f.type)){
      setRes({error:true,detail:'Tipo de arquivo não permitido'});
      return false;
    }
    
    return true;
  };
  
  const handleFileSelect=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];
    if(f && validateFile(f)) setFile(f);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Upload de Arquivo</h1>
          
          {/* Área de Drag & Drop */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              }
            `}
          >
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Arraste e solte um arquivo aqui ou
            </p>
            
            <label className="inline-block">
              <input 
                type="file" 
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,text/plain"
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                Selecionar Arquivo
              </span>
            </label>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Formatos aceitos: JPG, PNG, PDF, TXT (máx. 10MB)
            </p>
          </div>
          
          {/* Arquivo Selecionado */}
          {file && (
            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={onUpload} 
                  disabled={!file || progress > 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Enviar
                </Button>
              </div>
            </div>
          )}
          
          {/* Barra de Progresso */}
          {progress > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Enviando...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Resposta */}
          {res && (
            <div className={`
              mt-6 p-4 rounded-xl
              ${res.error 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }
            `}>
              {res.error ? (
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-red-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erro no upload</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{res.detail}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start space-x-3">
                    <svg className="h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Upload realizado com sucesso!</h3>
                      {res.url && (
                        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                          URL: <a href={res.url} className="underline" target="_blank" rel="noopener noreferrer">{res.url}</a>
                        </p>
                      )}
                    </div>
                  </div>
                  <pre className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(res, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}