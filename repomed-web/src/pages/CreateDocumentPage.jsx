import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { FileText, Save, ArrowLeft } from 'lucide-react'
import { templatesApi, documentsApi } from '../lib/api'
import { TemplateSelector } from '../components/TemplateSelector'
import { ArrayField } from '../components/ArrayField'

export default function CreateDocumentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedTemplateId = searchParams.get('template')

  const [currentTemplate, setCurrentTemplate] = React.useState(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      patient: {
        name: '',
        cpf: ''
      },
      fields: {}
    }
  })

  // Templates are now handled by TemplateSelector component

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: (data) => documentsApi.create(data),
    onSuccess: (response) => {
      navigate(`/documents/${response.data.id}`)
    },
    onError: (error) => {
      console.error('Error creating document:', error)
      alert('Erro ao criar documento. Tente novamente.')
    }
  })

  // Handle template selection from URL parameter
  React.useEffect(() => {
    if (selectedTemplateId && !currentTemplate) {
      // Template will be set when TemplateSelector loads
      console.log('Template ID from URL:', selectedTemplateId)
    }
  }, [selectedTemplateId, currentTemplate])

  const onSubmit = (data) => {
    if (!currentTemplate) {
      alert('Selecione um template primeiro')
      return
    }

    createDocumentMutation.mutate({
      templateId: currentTemplate.id,
      fields: data.fields,
      patient: data.patient
    })
  }

  // Loading/error handling is now done by TemplateSelector

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Documento</h1>
          <p className="text-gray-600 mt-1">
            Selecione um template e preencha os dados do documento médico
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <TemplateSelector
            onSelect={setCurrentTemplate}
            selectedTemplate={currentTemplate}
          />
        </div>

        {/* Document Form */}
        <div className="lg:col-span-2">
          {currentTemplate ? (
            <form onSubmit={handleSubmit(onSubmit)} className="card">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-medical-blue mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    2. {currentTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentTemplate.specialty} • v{currentTemplate.version}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Patient Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Dados do Paciente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nome do Paciente *</label>
                      <input
                        type="text"
                        className="form-input"
                        {...register('patient.name', { required: 'Nome é obrigatório' })}
                      />
                      {errors.patient?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.patient.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">CPF do Paciente *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="000.000.000-00"
                        {...register('patient.cpf', { required: 'CPF é obrigatório' })}
                      />
                      {errors.patient?.cpf && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.patient.cpf.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Template Fields */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Dados do Documento
                  </h3>
                  <div className="space-y-4">
                    {currentTemplate.fields?.map((field) => (
                      <div key={field.id}>
                        {field.type === 'array' ? (
                          <ArrayField
                            field={field}
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            errors={errors.fields}
                          />
                        ) : (
                          <>
                            <label className="form-label">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === 'text' && (
                              <input
                                type="text"
                                className="form-input"
                                {...register(`fields.${field.id}`, {
                                  required: field.required && `${field.label} é obrigatório`
                                })}
                              />
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                className="form-input"
                                rows={3}
                                {...register(`fields.${field.id}`, {
                                  required: field.required && `${field.label} é obrigatório`
                                })}
                              />
                            )}

                            {field.type === 'number' && (
                              <input
                                type="number"
                                className="form-input"
                                defaultValue={field.default}
                                {...register(`fields.${field.id}`, {
                                  required: field.required && `${field.label} é obrigatório`
                                })}
                              />
                            )}

                            {field.type === 'date' && (
                              <input
                                type="date"
                                className="form-input"
                                {...register(`fields.${field.id}`, {
                                  required: field.required && `${field.label} é obrigatório`
                                })}
                              />
                            )}

                            {field.type === 'select' && field.options && (
                              <select
                                className="form-input"
                                {...register(`fields.${field.id}`, {
                                  required: field.required && `${field.label} é obrigatório`
                                })}
                              >
                                <option value="">Selecione...</option>
                                {field.options.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}

                            {errors.fields?.[field.id] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.fields[field.id].message}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={createDocumentMutation.isPending}
                    className="btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createDocumentMutation.isPending ? 'Criando...' : 'Criar Documento'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="card text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um Template
              </h3>
              <p className="text-gray-600">
                Escolha um dos templates médicos disponíveis para começar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}