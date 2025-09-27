export function registerPrescriptionRoutes(fastify) {
  fastify.register(prescriptionsRoutes, { prefix: '/api/prescriptions' });
}

async function prescriptionsRoutes(fastify, options) {
  // Mock database for prescriptions
  let prescriptions = [
    {
      id: 1,
      patientId: '1',
      patientName: 'João Silva',
      doctorName: 'Dr. Sistema',
      doctorCrm: '123456-SP',
      date: '2024-01-15',
      medications: [
        {
          name: 'Paracetamol 500mg',
          dosage: '1 comprimido',
          frequency: '3x ao dia',
          duration: '7 dias',
          instructions: 'Tomar com alimentos'
        },
        {
          name: 'Ibuprofeno 600mg',
          dosage: '1 comprimido',
          frequency: '2x ao dia',
          duration: '5 dias',
          instructions: 'Não tomar em jejum'
        }
      ],
      diagnosis: 'Dor de cabeça tensional (G44.2)',
      observations: 'Retornar se sintomas persistirem após 7 dias. Evitar esforço físico excessivo.',
      returnDate: '2024-01-22',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      patientId: '2',
      patientName: 'Maria Santos',
      doctorName: 'Dr. Sistema',
      doctorCrm: '123456-SP',
      date: '2024-01-16',
      medications: [
        {
          name: 'Amoxicilina 500mg',
          dosage: '1 cápsula',
          frequency: '3x ao dia',
          duration: '10 dias',
          instructions: 'Completar todo o tratamento mesmo se sentir melhora'
        }
      ],
      diagnosis: 'Faringite bacteriana aguda (J02.9)',
      observations: 'Retornar em caso de piora do quadro ou não melhora em 48-72h',
      returnDate: '2024-01-26',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    }
  ]

  let nextId = 3

  // GET /api/prescriptions - List all prescriptions
  fastify.get('/', async (request, reply) => {
    try {
      const { 
        search = '', 
        patientId = '', 
        doctorName = '', 
        limit = 50, 
        offset = 0, 
        sortBy = 'date', 
        sortOrder = 'desc' 
      } = request.query

      let filteredPrescriptions = [...prescriptions]

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase()
        filteredPrescriptions = filteredPrescriptions.filter(prescription =>
          prescription.patientName.toLowerCase().includes(searchLower) ||
          prescription.doctorName.toLowerCase().includes(searchLower) ||
          prescription.diagnosis.toLowerCase().includes(searchLower) ||
          prescription.medications.some(med => 
            med.name.toLowerCase().includes(searchLower)
          )
        )
      }

      if (patientId) {
        filteredPrescriptions = filteredPrescriptions.filter(p => p.patientId === patientId)
      }

      if (doctorName) {
        filteredPrescriptions = filteredPrescriptions.filter(p => 
          p.doctorName.toLowerCase().includes(doctorName.toLowerCase())
        )
      }

      // Sort
      filteredPrescriptions.sort((a, b) => {
        let aVal = a[sortBy] || ''
        let bVal = b[sortBy] || ''
        
        if (sortBy === 'date' || sortBy === 'createdAt') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        } else {
          return aVal > bVal ? 1 : -1
        }
      })

      // Paginate
      const startIndex = parseInt(offset)
      const limitInt = parseInt(limit)
      const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, startIndex + limitInt)

      reply.send({
        success: true,
        data: paginatedPrescriptions,
        pagination: {
          total: filteredPrescriptions.length,
          limit: limitInt,
          offset: startIndex,
          hasMore: startIndex + limitInt < filteredPrescriptions.length
        }
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // GET /api/prescriptions/:id - Get specific prescription
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const prescription = prescriptions.find(p => p.id === parseInt(id))

      if (!prescription) {
        return reply.status(404).send({
          success: false,
          message: 'Prescrição não encontrada'
        })
      }

      reply.send({
        success: true,
        data: prescription
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // POST /api/prescriptions - Create new prescription
  fastify.post('/', async (request, reply) => {
    try {
      const {
        patientId,
        patientName,
        doctorName,
        doctorCrm,
        date,
        medications,
        diagnosis,
        observations,
        returnDate
      } = request.body

      // Basic validation
      if (!patientId || !doctorName || !doctorCrm || !medications || medications.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Dados obrigatórios: patientId, doctorName, doctorCrm, medications'
        })
      }

      // Validate medications
      for (const med of medications) {
        if (!med.name || !med.dosage || !med.frequency) {
          return reply.status(400).send({
            success: false,
            message: 'Cada medicamento deve ter nome, dosagem e frequência'
          })
        }
      }

      const newPrescription = {
        id: nextId++,
        patientId: patientId.toString(),
        patientName: patientName || `Paciente ${patientId}`,
        doctorName,
        doctorCrm,
        date: date || new Date().toISOString().split('T')[0],
        medications: medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration || '',
          instructions: med.instructions || ''
        })),
        diagnosis: diagnosis || '',
        observations: observations || '',
        returnDate: returnDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      prescriptions.push(newPrescription)

      reply.status(201).send({
        success: true,
        message: 'Prescrição criada com sucesso',
        data: newPrescription
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // PUT /api/prescriptions/:id - Update prescription
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const prescriptionIndex = prescriptions.findIndex(p => p.id === parseInt(id))

      if (prescriptionIndex === -1) {
        return reply.status(404).send({
          success: false,
          message: 'Prescrição não encontrada'
        })
      }

      const {
        patientId,
        patientName,
        doctorName,
        doctorCrm,
        date,
        medications,
        diagnosis,
        observations,
        returnDate
      } = request.body

      // Update prescription
      const updatedPrescription = {
        ...prescriptions[prescriptionIndex],
        patientId: patientId || prescriptions[prescriptionIndex].patientId,
        patientName: patientName || prescriptions[prescriptionIndex].patientName,
        doctorName: doctorName || prescriptions[prescriptionIndex].doctorName,
        doctorCrm: doctorCrm || prescriptions[prescriptionIndex].doctorCrm,
        date: date || prescriptions[prescriptionIndex].date,
        medications: medications || prescriptions[prescriptionIndex].medications,
        diagnosis: diagnosis || prescriptions[prescriptionIndex].diagnosis,
        observations: observations || prescriptions[prescriptionIndex].observations,
        returnDate: returnDate || prescriptions[prescriptionIndex].returnDate,
        updatedAt: new Date().toISOString()
      }

      prescriptions[prescriptionIndex] = updatedPrescription

      reply.send({
        success: true,
        message: 'Prescrição atualizada com sucesso',
        data: updatedPrescription
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // DELETE /api/prescriptions/:id - Delete prescription
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const prescriptionIndex = prescriptions.findIndex(p => p.id === parseInt(id))

      if (prescriptionIndex === -1) {
        return reply.status(404).send({
          success: false,
          message: 'Prescrição não encontrada'
        })
      }

      const deletedPrescription = prescriptions.splice(prescriptionIndex, 1)[0]

      reply.send({
        success: true,
        message: 'Prescrição excluída com sucesso',
        data: deletedPrescription
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // GET /api/prescriptions/patient/:patientId - Get prescriptions for specific patient
  fastify.get('/patient/:patientId', async (request, reply) => {
    try {
      const { patientId } = request.params
      const patientPrescriptions = prescriptions.filter(p => p.patientId === patientId)

      // Sort by date descending
      patientPrescriptions.sort((a, b) => new Date(b.date) - new Date(a.date))

      reply.send({
        success: true,
        data: patientPrescriptions,
        total: patientPrescriptions.length
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })

  // POST /api/prescriptions/:id/print - Generate prescription for printing
  fastify.post('/:id/print', async (request, reply) => {
    try {
      const { id } = request.params
      const prescription = prescriptions.find(p => p.id === parseInt(id))

      if (!prescription) {
        return reply.status(404).send({
          success: false,
          message: 'Prescrição não encontrada'
        })
      }

      // Generate a printable version
      const printableData = {
        ...prescription,
        generatedAt: new Date().toISOString(),
        printUrl: `/prescription/${prescription.id}/print`
      }

      reply.send({
        success: true,
        message: 'Dados para impressão gerados',
        data: printableData
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      })
    }
  })
}