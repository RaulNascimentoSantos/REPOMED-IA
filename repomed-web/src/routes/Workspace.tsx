import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function Workspace(){
  const nav = useNavigate();
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-900">RepoMed IA</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" onClick={() => nav('/patients')}>
                Pacientes
              </Button>
              <Button variant="ghost" onClick={() => nav('/templates')}>
                Templates
              </Button>
              <Button variant="ghost" onClick={() => nav('/documents-new')}>
                Documentos
              </Button>
              <Button variant="ghost" onClick={() => nav('/metrics')}>
                Métricas
              </Button>
              <Button variant="ghost" onClick={() => nav('/account/profile')}>
                Perfil
              </Button>
              <Button variant="ghost" onClick={logout}>
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Workspace</h1>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-medium text-slate-900">👥 Pacientes</h2>
              <p className="text-sm text-slate-500 mt-1">Gerencie cadastros de pacientes</p>
              <Button className="mt-3 w-full" onClick={() => nav('/patients')}>
                Ver pacientes
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-medium text-slate-900">📋 Templates</h2>
              <p className="text-sm text-slate-500 mt-1">Modelos de documentos médicos</p>
              <Button className="mt-3 w-full" onClick={() => nav('/templates')}>
                Ver templates
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-medium text-slate-900">📄 Documentos</h2>
              <p className="text-sm text-slate-500 mt-1">Crie e assine documentos</p>
              <Button className="mt-3 w-full" onClick={() => nav('/documents-new')}>
                Ver documentos
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-medium text-slate-900">💊 Prescrições</h2>
              <p className="text-sm text-slate-500 mt-1">Criar prescrições médicas</p>
              <Button className="mt-3 w-full" onClick={() => nav('/prescription/create')}>
                Nova prescrição
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-4">
                <h4 className="font-medium text-slate-900">Novo Paciente</h4>
                <p className="text-sm text-slate-500 mt-1">Cadastre rapidamente</p>
                <Button variant="secondary" className="mt-2 w-full" onClick={() => nav('/patients/create')}>
                  Cadastrar
                </Button>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h4 className="font-medium text-slate-900">Novo Documento</h4>
                <p className="text-sm text-slate-500 mt-1">Baseado em template</p>
                <Button variant="secondary" className="mt-2 w-full" onClick={() => nav('/documents/new')}>
                  Criar
                </Button>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h4 className="font-medium text-slate-900">Ver Métricas</h4>
                <p className="text-sm text-slate-500 mt-1">Dashboard do sistema</p>
                <Button variant="secondary" className="mt-2 w-full" onClick={() => nav('/metrics')}>
                  Acessar
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">RepoMed IA</h2>
            <p className="opacity-90">
              Sistema médico digital para gestão completa de documentos com assinatura eletrônica.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}