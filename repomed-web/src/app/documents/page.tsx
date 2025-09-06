'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Eye,
  Edit,
  Share,
  Clock,
  User,
  Calendar,
  CheckCircle
} from 'lucide-react';

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock documents data
  const documents = [
    {
      id: 1,
      title: 'Receita Médica - Maria Silva',
      type: 'Receita',
      patient: 'Maria Silva',
      doctor: 'Dr. João Silva',
      date: '2024-12-06',
      status: 'assinado',
      pages: 2
    },
    {
      id: 2,
      title: 'Atestado Médico - João Santos',
      type: 'Atestado',
      patient: 'João Santos',
      doctor: 'Dr. João Silva',
      date: '2024-12-05',
      status: 'pendente',
      pages: 1
    },
    {
      id: 3,
      title: 'Relatório de Exames - Ana Costa',
      type: 'Relatório',
      patient: 'Ana Costa',
      doctor: 'Dr. João Silva',
      date: '2024-12-04',
      status: 'assinado',
      pages: 3
    },
    {
      id: 4,
      title: 'Prescrição Médica - Carlos Lima',
      type: 'Prescrição',
      patient: 'Carlos Lima',
      doctor: 'Dr. João Silva',
      date: '2024-12-03',
      status: 'rascunho',
      pages: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assinado': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rascunho': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Documentos Médicos
            </h1>
            <p className="text-muted-foreground">Gerencie receitas, atestados e relatórios</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
            
            <Button variant="medical" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Documento</span>
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assinados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'assinado').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === 'pendente').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(document.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{document.title}</h4>
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{document.patient}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(document.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <span>{document.pages} página{document.pages > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </Button>
                      
                      {document.status === 'rascunho' && (
                        <Button size="sm" variant="outline" className="flex items-center space-x-1">
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Button>
                      )}
                      
                      {document.status === 'assinado' && (
                        <>
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>Baixar</span>
                          </Button>
                          
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <Share className="w-4 h-4" />
                            <span>Compartilhar</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}