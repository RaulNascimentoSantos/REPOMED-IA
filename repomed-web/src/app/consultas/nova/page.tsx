'use client';

import React from 'react';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';

export default function NovaConsultaPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-400" />
          Nova Consulta
        </h1>
        <p className="text-blue-300">
          Agendar nova consulta médica
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Paciente
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none"
              placeholder="Buscar paciente..."
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Data da Consulta
            </label>
            <input
              type="date"
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Horário
            </label>
            <input
              type="time"
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Tipo de Consulta
            </label>
            <select className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none">
              <option>Consulta de Rotina</option>
              <option>Retorno</option>
              <option>Urgência</option>
              <option>Telemedicina</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-white font-medium mb-2">
            Observações
          </label>
          <textarea
            className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none"
            rows={4}
            placeholder="Observações sobre a consulta..."
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendar Consulta
          </button>
          <button className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}