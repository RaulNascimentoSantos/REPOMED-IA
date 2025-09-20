'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface VitalSign {
  id: string;
  name: string;
  value: number;
  unit: string;
  normal: { min: number; max: number };
  icon: any;
  color: string;
  trend: number[];
  lastUpdate: string;
}

interface VitalSignsMonitorProps {
  patientId?: string;
  realTime?: boolean;
  compact?: boolean;
}

export default function VitalSignsMonitor({
  patientId,
  realTime = false,
  compact = false
}: VitalSignsMonitorProps) {
  const [vitals, setVitals] = useState<VitalSign[]>([
    {
      id: 'heart_rate',
      name: 'Frequência Cardíaca',
      value: 72,
      unit: 'bpm',
      normal: { min: 60, max: 100 },
      icon: Heart,
      color: 'red',
      trend: [68, 70, 72, 74, 72, 71, 72],
      lastUpdate: '2 min atrás'
    },
    {
      id: 'blood_pressure',
      name: 'Pressão Arterial',
      value: 120,
      unit: 'mmHg',
      normal: { min: 90, max: 140 },
      icon: Activity,
      color: 'blue',
      trend: [118, 119, 120, 122, 120, 119, 120],
      lastUpdate: '2 min atrás'
    },
    {
      id: 'temperature',
      name: 'Temperatura',
      value: 36.5,
      unit: '°C',
      normal: { min: 36.1, max: 37.2 },
      icon: Thermometer,
      color: 'orange',
      trend: [36.3, 36.4, 36.5, 36.6, 36.5, 36.4, 36.5],
      lastUpdate: '5 min atrás'
    },
    {
      id: 'oxygen',
      name: 'Saturação O2',
      value: 98,
      unit: '%',
      normal: { min: 95, max: 100 },
      icon: Wind,
      color: 'green',
      trend: [97, 98, 98, 99, 98, 97, 98],
      lastUpdate: '1 min atrás'
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(realTime);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setVitals(prevVitals =>
        prevVitals.map(vital => ({
          ...vital,
          value: vital.value + (Math.random() - 0.5) * 2,
          trend: [...vital.trend.slice(1), vital.value + (Math.random() - 0.5) * 2],
          lastUpdate: 'agora'
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatus = (value: number, normal: { min: number; max: number }) => {
    if (value < normal.min || value > normal.max) {
      return { status: 'abnormal', color: 'text-red-400', bgColor: 'bg-red-600' };
    }
    return { status: 'normal', color: 'text-green-400', bgColor: 'bg-green-600' };
  };

  const getTrend = (trend: number[]) => {
    if (trend.length < 2) return 'stable';
    const last = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    if (last > previous + 1) return 'up';
    if (last < previous - 1) return 'down';
    return 'stable';
  };

  const colorClasses = {
    red: { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-500' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-400', border: 'border-orange-500' },
    green: { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-500' }
  };

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Sinais Vitais
          </h3>
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {vitals.map((vital) => {
            const status = getStatus(vital.value, vital.normal);
            const Icon = vital.icon;

            return (
              <div key={vital.id} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${status.color}`} />
                <div>
                  <span className="text-white text-sm font-medium">
                    {vital.value.toFixed(1)} {vital.unit}
                  </span>
                  <p className="text-xs text-slate-400">{vital.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Monitor de Sinais Vitais</h3>
            <p className="text-slate-400 text-sm">
              {patientId ? `Paciente: ${patientId}` : 'Monitoramento em tempo real'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isMonitoring ? 'Monitorando' : 'Iniciar Monitor'}
          </button>

          <div className={`w-3 h-3 rounded-full ${
            isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`} />
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vitals.map((vital) => {
          const status = getStatus(vital.value, vital.normal);
          const trend = getTrend(vital.trend);
          const Icon = vital.icon;
          const colors = colorClasses[vital.color];

          return (
            <div
              key={vital.id}
              className={`
                bg-slate-900 rounded-lg p-4 border border-slate-600
                hover:${colors.border} hover:shadow-lg hover:shadow-${vital.color}-500/20
                transform hover:scale-105 transition-all duration-300 group
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                  <span className="text-white font-medium">{vital.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  {trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                  {trend === 'down' && <TrendingDown className="w-4 h-4 text-blue-400" />}
                  {status.status === 'abnormal' ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>

              {/* Value */}
              <div className="mb-3">
                <span className={`text-3xl font-bold ${status.color} group-hover:text-white transition-colors`}>
                  {vital.value.toFixed(1)}
                </span>
                <span className="text-slate-400 ml-1">{vital.unit}</span>
              </div>

              {/* Normal Range */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Normal: {vital.normal.min} - {vital.normal.max} {vital.unit}</span>
                  <span className={status.color}>{status.status === 'normal' ? 'Normal' : 'Alterado'}</span>
                </div>

                {/* Range Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 relative">
                  <div
                    className={`absolute h-2 ${colors.bg} rounded-full opacity-30`}
                    style={{
                      left: `${((vital.normal.min - 0) / (vital.normal.max * 1.5)) * 100}%`,
                      width: `${((vital.normal.max - vital.normal.min) / (vital.normal.max * 1.5)) * 100}%`
                    }}
                  />
                  <div
                    className={`absolute w-1 h-4 ${status.bgColor} rounded-full -mt-1 transition-all duration-500`}
                    style={{
                      left: `${(vital.value / (vital.normal.max * 1.5)) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Mini Trend Chart */}
              <div className="mb-2">
                <div className="flex items-end space-x-1 h-8">
                  {vital.trend.map((value, index) => (
                    <div
                      key={index}
                      className={`w-2 ${colors.bg} rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity`}
                      style={{
                        height: `${(value / Math.max(...vital.trend)) * 100}%`,
                        minHeight: '2px'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Last Update */}
              <p className="text-xs text-slate-500">
                Última atualização: {vital.lastUpdate}
              </p>
            </div>
          );
        })}
      </div>

      {/* Emergency Alert */}
      {vitals.some(vital => getStatus(vital.value, vital.normal).status === 'abnormal') && (
        <div className="mt-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <h4 className="text-red-400 font-semibold">Atenção: Sinais Vitais Alterados</h4>
              <p className="text-red-300 text-sm">
                Um ou mais sinais vitais estão fora dos valores normais. Considere avaliação médica.
              </p>
            </div>
            <button className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Notificar Médico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}