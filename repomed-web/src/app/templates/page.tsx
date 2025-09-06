'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Copy,
  Star,
  Clock,
  User,
  Stethoscope,
  Heart,
  Brain,
  Activity
} from 'lucide-react';

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Mock templates data
  const templates = [
    {
      id: 1,
      title: 'Receita para Hipertensão',
      description: 'Template padrão para prescrição de medicamentos anti-hipertensivos',
      category: 'Cardiologia',
      icon: Heart,
      uses: 45,
      lastUsed: '2024-12-05',
      favorite: true,
      tags: ['hipertensao', 'medicamentos', 'cardiologia']
    },
    {
      id: 2,
      title: 'Atestado Médico Padrão',
      description: 'Modelo de atestado médico para afastamento do trabalho',
      category: 'Geral',
      icon: FileText,
      uses: 78,
      lastUsed: '2024-12-06',
      favorite: false,
      tags: ['atestado', 'trabalho', 'afastamento']
    },
    {
      id: 3,
      title: 'Relatório Neurológico',
      description: 'Template para avaliação neurológica completa',
      category: 'Neurologia',
      icon: Brain,
      uses: 23,
      lastUsed: '2024-12-04',
      favorite: true,
      tags: ['neurologia', 'avaliacao', 'relatorio']
    },
    {
      id: 4,
      title: 'Prescrição Pediátrica',
      description: 'Modelo específico para prescrições infantis com dosagens adequadas',
      category: 'Pediatria',
      icon: Stethoscope,
      uses: 34,
      lastUsed: '2024-12-03',
      favorite: false,
      tags: ['pediatria', 'infantil', 'dosagem']
    },
    {
      id: 5,
      title: 'Solicitação de Exames',
      description: 'Template para solicitação de exames laboratoriais e de imagem',
      category: 'Geral',
      icon: Activity,
      uses: 67,
      lastUsed: '2024-12-05',
      favorite: true,
      tags: ['exames', 'laboratorio', 'imagem']
    }
  ];

  const categories = [
    { id: 'todos', label: 'Todos', count: templates.length },
    { id: 'Geral', label: 'Geral', count: templates.filter(t => t.category === 'Geral').length },
    { id: 'Cardiologia', label: 'Cardiologia', count: templates.filter(t => t.category === 'Cardiologia').length },
    { id: 'Neurologia', label: 'Neurologia', count: templates.filter(t => t.category === 'Neurologia').length },
    { id: 'Pediatria', label: 'Pediatria', count: templates.filter(t => t.category === 'Pediatria').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todos' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Templates Médicos
            </h1>
            <p className="text-muted-foreground">Modelos prontos para documentos médicos</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
            
            <Button variant="medical" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Criar Template</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{category.label}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar templates por nome, descrição ou tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="medical-card hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <template.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={template.favorite ? "default" : "ghost"}
                        className="shrink-0"
                      >
                        <Star className={`w-4 h-4 ${template.favorite ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{template.uses} usos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(template.lastUsed).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" variant="medical" className="flex-1">
                        <FileText className="w-4 h-4 mr-1" />
                        Usar Template
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não encontramos templates que correspondem aos seus critérios de busca.
                  </p>
                  <Button variant="medical">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Novo Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}