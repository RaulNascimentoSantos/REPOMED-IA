import * as React from 'react';
import { Checkbox } from '../../components/ui/Checkbox';

export default function Settings(){
  const [dense, setDense] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Configurações</h1>
      <div className="mt-4 bg-white rounded-2xl border p-4 max-w-md space-y-4">
        <div>
          <h2 className="font-medium mb-2">Interface</h2>
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={dense} 
              onChange={e => setDense(e.currentTarget.checked)} 
            /> 
            Densidade compacta
          </label>
          <label className="flex items-center gap-2 mt-2">
            <Checkbox 
              checked={darkMode} 
              onChange={e => setDarkMode(e.currentTarget.checked)} 
            /> 
            Modo escuro
          </label>
        </div>
        
        <div>
          <h2 className="font-medium mb-2">Notificações</h2>
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={notifications} 
              onChange={e => setNotifications(e.currentTarget.checked)} 
            /> 
            Receber notificações por email
          </label>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-slate-500">
            As configurações são salvas localmente no navegador.
          </p>
        </div>
      </div>
    </div>
  );
}