'use client';

import React, { useState } from 'react';
import { History, Calendar, User, Search, Filter } from 'lucide-react';

export default function HistoricoConsultasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const consultas = [
    {
      id: 1,
      paciente: 'Maria Silva',
      data: '2024-01-15',
      horario: '14:30',
      tipo: 'Consulta de Rotina',
      status: 'Concluída',
      observacoes: 'Consulta de rotina, paciente apresentou melhora.'
    },
    {
      id: 2,
      paciente: 'João Santos',
      data: '2024-01-14',
      horario: '09:00',
      tipo: 'Retorno',
      status: 'Concluída',
      observacoes: 'Retorno para avaliação de medicação.'
    },
    {
      id: 3,
      paciente: 'Ana Costa',
      data: '2024-01-13',
      horario: '16:00',
      tipo: 'Telemedicina',
      status: 'Concluída',
      observacoes: 'Consulta online realizada com sucesso.'
    }
  ];

  const filteredConsultas = consultas.filter(consulta =>
    consulta.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consulta.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <History className="w-8 h-8 text-blue-400" />
          Histórico de Consultas
        </h1>
        <p className="text-blue-300">
          Visualizar histórico completo de consultas realizadas
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por paciente ou tipo de consulta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select className="px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none">
              <option value="">Todos os tipos</option>
              <option value="rotina">Consulta de Rotina</option>
              <option value="retorno">Retorno</option>
              <option value="urgencia">Urgência</option>
              <option value="telemedicina">Telemedicina</option>
            </select>

            <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {filteredConsultas.map((consulta) => (
          <div key={consulta.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{consulta.paciente}</h3>
                  <p className="text-slate-400 text-sm">{consulta.tipo}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 md:mt-0">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{consulta.data} às {consulta.horario}</span>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                  {consulta.status}
                </span>
              </div>
            </div>

            {consulta.observacoes && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-300 text-sm">{consulta.observacoes}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Ver Detalhes
              </button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors">
                Gerar Relatório
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredConsultas.length === 0 && (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Nenhuma consulta encontrada</h3>
          <p className="text-slate-400">Tente ajustar os filtros de busca.</p>
        </div>
      )}
    </div>
  );
}