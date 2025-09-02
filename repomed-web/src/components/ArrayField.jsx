import React from 'react'
import { Plus, X } from 'lucide-react'

export function ArrayField({ field, register, setValue, watch, errors }) {
  const fieldName = `fields.${field.id}`
  const values = watch(fieldName) || []

  const addItem = () => {
    const newValues = [...values, '']
    setValue(fieldName, newValues)
  }

  const removeItem = (index) => {
    const newValues = values.filter((_, i) => i !== index)
    setValue(fieldName, newValues)
  }

  const updateItem = (index, value) => {
    const newValues = [...values]
    newValues[index] = value
    setValue(fieldName, newValues)
  }

  React.useEffect(() => {
    if (values.length === 0) {
      addItem() // Start with at least one item
    }
  }, [])

  return (
    <div>
      <label className="form-label">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            {field.id === 'medications' ? (
              // Special handling for medications
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Nome do medicamento"
                  className="form-input text-sm"
                  value={value.name || ''}
                  onChange={(e) => updateItem(index, { 
                    ...value, 
                    name: e.target.value 
                  })}
                />
                <input
                  type="text"
                  placeholder="Dosagem"
                  className="form-input text-sm"
                  value={value.dosage || ''}
                  onChange={(e) => updateItem(index, { 
                    ...value, 
                    dosage: e.target.value 
                  })}
                />
                <input
                  type="text"
                  placeholder="Frequência"
                  className="form-input text-sm"
                  value={value.frequency || ''}
                  onChange={(e) => updateItem(index, { 
                    ...value, 
                    frequency: e.target.value 
                  })}
                />
              </div>
            ) : field.id === 'exams' ? (
              // Special handling for exams
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do exame"
                  className="form-input text-sm"
                  value={value.name || ''}
                  onChange={(e) => updateItem(index, { 
                    ...value, 
                    name: e.target.value 
                  })}
                />
                <select
                  className="form-input text-sm"
                  value={value.urgency || ''}
                  onChange={(e) => updateItem(index, { 
                    ...value, 
                    urgency: e.target.value 
                  })}
                >
                  <option value="">Urgência</option>
                  <option value="rotina">Rotina</option>
                  <option value="urgente">Urgente</option>
                  <option value="priority">Prioritário</option>
                </select>
              </div>
            ) : (
              // Generic array item
              <input
                type="text"
                className="form-input flex-1"
                placeholder={`${field.label} ${index + 1}`}
                value={value || ''}
                onChange={(e) => updateItem(index, e.target.value)}
              />
            )}
            
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              disabled={values.length === 1}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addItem}
          className="flex items-center text-sm text-medical-blue hover:text-blue-700 font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar {field.id === 'medications' ? 'medicamento' : 
                     field.id === 'exams' ? 'exame' : 'item'}
        </button>
      </div>

      {errors?.[field.id] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[field.id].message}
        </p>
      )}
    </div>
  )
}