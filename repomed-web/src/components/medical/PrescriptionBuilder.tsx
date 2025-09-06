'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Calculator,
  Info,
  Pill,
  Clock,
  Weight,
  User,
  BookOpen,
  Shield
} from 'lucide-react'
import Fuse from 'fuse.js'

interface Medication {
  id: string
  name: string
  activeIngredient: string
  strength: string
  form: string
  manufacturer: string
  controlled: boolean
  interactions: string[]
  contraindications: string[]
  pediatricDose?: string
  adultDose: string
  maxDailyDose: string
  price?: number
}

interface PrescribedMedication {
  medication: Medication
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: number
  warnings: string[]
}

interface Patient {
  age: number
  weight: number
  allergies: string[]
  conditions: string[]
  currentMedications: string[]
}

// Mock medication database (would be real ANVISA API)
const MOCK_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    activeIngredient: 'Paracetamol',
    strength: '500mg',
    form: 'Comprimido',
    manufacturer: 'EMS',
    controlled: false,
    interactions: ['Varfarina', 'Carbamazepina'],
    contraindications: ['Hepatopatia grave', 'Alcoolismo'],
    adultDose: '500-1000mg a cada 6-8 horas',
    maxDailyDose: '4000mg',
    price: 12.50
  },
  {
    id: '2',
    name: 'Amoxicilina 500mg',
    activeIngredient: 'Amoxicilina',
    strength: '500mg',
    form: 'Cápsula',
    manufacturer: 'Medley',
    controlled: false,
    interactions: ['Metotrexato', 'Anticoagulantes'],
    contraindications: ['Alergia à penicilina', 'Mononucleose'],
    adultDose: '500mg a cada 8 horas',
    maxDailyDose: '3000mg',
    pediatricDose: '20-40mg/kg/dia dividido em 3 doses',
    price: 18.90
  },
  {
    id: '3',
    name: 'Morfina 10mg',
    activeIngredient: 'Sulfato de Morfina',
    strength: '10mg',
    form: 'Comprimido de liberação controlada',
    manufacturer: 'Cristália',
    controlled: true,
    interactions: ['Depressores do SNC', 'Inibidores da MAO'],
    contraindications: ['Depressão respiratória', 'Íleo paralítico'],
    adultDose: '10-30mg a cada 12 horas',
    maxDailyDose: '200mg',
    price: 45.60
  }
]

const COMMON_TEMPLATES = [
  {
    name: 'Gripe/Resfriado',
    medications: [
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: '6/6h', duration: '5 dias' },
      { name: 'Loratadina 10mg', dosage: '10mg', frequency: '24/24h', duration: '7 dias' }
    ]
  },
  {
    name: 'Hipertensão Inicial',
    medications: [
      { name: 'Losartana 50mg', dosage: '50mg', frequency: '24/24h', duration: 'Uso contínuo' },
      { name: 'Hidroclorotiazida 25mg', dosage: '25mg', frequency: '24/24h', duration: 'Uso contínuo' }
    ]
  }
]

interface PrescriptionBuilderProps {
  patient?: Patient
  onPrescriptionChange?: (medications: PrescribedMedication[]) => void
  className?: string
}

export default function PrescriptionBuilder({ 
  patient, 
  onPrescriptionChange,
  className = '' 
}: PrescriptionBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Medication[]>([])
  const [prescribedMeds, setPrescribedMeds] = useState<PrescribedMedication[]>([])
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [showDoseCalculator, setShowDoseCalculator] = useState(false)
  const [interactions, setInteractions] = useState<string[]>([])
  const [showTemplates, setShowTemplates] = useState(false)

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(MOCK_MEDICATIONS, {
    keys: ['name', 'activeIngredient', 'manufacturer'],
    threshold: 0.3,
    includeScore: true
  })

  // Search medications with AI-like fuzzy matching
  const searchMedications = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    const results = fuse.search(term, { limit: 10 })
    setSearchResults(results.map(result => result.item))
  }, [fuse])

  // Calculate pediatric dose
  const calculatePediatricDose = useCallback((medication: Medication, weight: number) => {
    if (!medication.pediatricDose || !weight) return null
    
    // Parse dose like "20-40mg/kg/dia"
    const doseMatch = medication.pediatricDose.match(/(\d+)-(\d+)mg\/kg/)
    if (doseMatch) {
      const minDose = parseInt(doseMatch[1]) * weight
      const maxDose = parseInt(doseMatch[2]) * weight
      return `${minDose}-${maxDose}mg/dia`
    }
    
    return medication.pediatricDose
  }, [])

  // Check for drug interactions
  const checkInteractions = useCallback((newMedication: Medication) => {
    const currentMeds = prescribedMeds.map(pm => pm.medication)
    const allInteractions: string[] = []

    currentMeds.forEach(med => {
      med.interactions.forEach(interaction => {
        if (newMedication.interactions.includes(interaction) || 
            newMedication.name.includes(interaction) ||
            interaction.includes(newMedication.activeIngredient)) {
          allInteractions.push(`⚠️ ${med.name} x ${newMedication.name}: ${interaction}`)
        }
      })
    })

    // Check patient allergies
    if (patient?.allergies) {
      patient.allergies.forEach(allergy => {
        if (newMedication.activeIngredient.toLowerCase().includes(allergy.toLowerCase()) ||
            newMedication.name.toLowerCase().includes(allergy.toLowerCase())) {
          allInteractions.push(`🚨 ALERGIA: Paciente alérgico a ${allergy}`)
        }
      })
    }

    return allInteractions
  }, [prescribedMeds, patient])

  // Add medication to prescription
  const addMedication = useCallback((medication: Medication) => {
    const warnings = checkInteractions(medication)
    
    const prescribed: PrescribedMedication = {
      medication,
      dosage: medication.adultDose.split(' ')[0], // Extract first dose
      frequency: '8/8h',
      duration: '7 dias',
      instructions: 'Tomar com alimentos',
      quantity: 30,
      warnings
    }

    // Auto-calculate pediatric dose if patient is under 18
    if (patient && patient.age < 18 && patient.weight && medication.pediatricDose) {
      const pediatricDose = calculatePediatricDose(medication, patient.weight)
      if (pediatricDose) {
        prescribed.dosage = pediatricDose
        prescribed.instructions = 'Dose pediátrica calculada por peso'
      }
    }

    setPrescribedMeds(prev => [...prev, prescribed])
    setSelectedMed(null)
    setSearchTerm('')
    setSearchResults([])
  }, [checkInteractions, calculatePediatricDose, patient])

  // Remove medication
  const removeMedication = useCallback((index: number) => {
    setPrescribedMeds(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Apply template
  const applyTemplate = useCallback((template: any) => {
    // This would search for actual medications and add them
    console.log('Applying template:', template.name)
    setShowTemplates(false)
  }, [])

  // Update prescription change callback
  useEffect(() => {
    onPrescriptionChange?.(prescribedMeds)
  }, [prescribedMeds, onPrescriptionChange])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prescrição Digital
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Busca inteligente com validação de interações
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
            onClick={() => setShowTemplates(!showTemplates)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
            onClick={() => setShowDoseCalculator(!showDoseCalculator)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calculator className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="medical-card p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Templates Comuns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMMON_TEMPLATES.map((template, index) => (
                <motion.button
                  key={template.name}
                  className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => applyTemplate(template)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {template.medications.length} medicamentos
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Section */}
      <div className="medical-card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar medicamentos (ex: paracetamol, amoxicilina)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              searchMedications(e.target.value)
            }}
            className="input-modern pl-10"
          />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="mt-4 space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {searchResults.map((medication, index) => (
                <motion.div
                  key={medication.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => addMedication(medication)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {medication.name}
                        </h4>
                        {medication.controlled && (
                          <Shield className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {medication.activeIngredient} • {medication.manufacturer}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {medication.form} • Dose: {medication.adultDose}
                      </p>
                    </div>
                    {medication.price && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          R$ {medication.price.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prescribed Medications */}
      {prescribedMeds.length > 0 && (
        <div className="medical-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Medicamentos Prescritos
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {prescribedMeds.length} medicamento{prescribedMeds.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {prescribedMeds.map((prescribed, index) => (
              <motion.div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {prescribed.medication.name}
                      </h5>
                      {prescribed.medication.controlled && (
                        <Shield className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Dose:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {prescribed.dosage}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Frequência:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {prescribed.frequency}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Duração:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {prescribed.duration}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quantidade:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {prescribed.quantity}
                        </div>
                      </div>
                    </div>

                    {prescribed.instructions && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Instruções:</span> {prescribed.instructions}
                      </div>
                    )}

                    {/* Warnings */}
                    {prescribed.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {prescribed.warnings.map((warning, wIndex) => (
                          <div 
                            key={wIndex}
                            className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                          >
                            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <span className="text-sm text-yellow-800 dark:text-yellow-300">
                              {warning}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.button
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => removeMedication(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Info (if provided) */}
      {patient && (
        <div className="medical-card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Informações do Paciente</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Idade:</span>
              <div className="font-medium text-gray-900 dark:text-white">{patient.age} anos</div>
            </div>
            {patient.weight && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Peso:</span>
                <div className="font-medium text-gray-900 dark:text-white">{patient.weight} kg</div>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400">Alergias:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {patient.allergies.length || 'Nenhuma'}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Medicações:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {patient.currentMedications.length || 'Nenhuma'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}