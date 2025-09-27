const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Serviço de Integração FHIR R4 e RNDS
 * Implementa interoperabilidade com Rede Nacional de Dados em Saúde
 */
class FHIRService {
  constructor() {
    // Configurações RNDS
    this.rndsConfig = {
      baseUrl: process.env.RNDS_BASE_URL || 'https://ehr-services.saude.gov.br/api/fhir/r4',
      authUrl: process.env.RNDS_AUTH_URL || 'https://ehr-auth.saude.gov.br/api/token',
      clientId: process.env.RNDS_CLIENT_ID,
      clientSecret: process.env.RNDS_CLIENT_SECRET,
      certificatePath: process.env.RNDS_CERTIFICATE_PATH,
      privateKeyPath: process.env.RNDS_PRIVATE_KEY_PATH
    };

    // Cache de token de acesso
    this.accessToken = null;
    this.tokenExpires = null;

    // Mapeamento de códigos brasileiros
    this.codeMappings = {
      // CID-10 para SNOMED CT
      cid10ToSnomed: new Map([
        ['I10', '38341003'], // Hipertensão
        ['E11', '44054006'], // Diabetes tipo 2
        ['J44', '13645005'], // DPOC
      ]),
      
      // CBhPM para CPT
      cbhpmToCpt: new Map([
        ['40101019', '99213'], // Consulta médica
        ['40301010', '93000'], // ECG
      ]),

      // Unidades brasileiras
      ucumUnits: new Map([
        ['mg/dL', 'mg/dL'],
        ['mmHg', 'mm[Hg]'],
        ['bpm', '/min'],
        ['kg', 'kg'],
        ['cm', 'cm']
      ])
    };
  }

  /**
   * Autentica no RNDS usando certificado ICP-Brasil
   */
  async authenticateRNDS() {
    try {
      if (this.accessToken && this.tokenExpires && Date.now() < this.tokenExpires) {
        return this.accessToken;
      }

      const authData = {
        grant_type: 'client_credentials',
        client_id: this.rndsConfig.clientId,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: await this.generateClientAssertion()
      };

      const response = await axios.post(this.rndsConfig.authUrl, authData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: await this.getHttpsAgent()
      });

      this.accessToken = response.data.access_token;
      this.tokenExpires = Date.now() + (response.data.expires_in * 1000);

      console.log('RNDS authentication successful');
      return this.accessToken;

    } catch (error) {
      console.error('RNDS authentication failed:', error.response?.data || error.message);
      throw new Error('Falha na autenticação RNDS');
    }
  }

  /**
   * Converte paciente para formato FHIR R4
   */
  convertPatientToFHIR(patientData) {
    const fhirPatient = {
      resourceType: 'Patient',
      id: patientData.id || uuidv4(),
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0']
      },
      identifier: [],
      active: patientData.active !== false,
      name: [],
      telecom: [],
      gender: this.mapGender(patientData.gender),
      birthDate: patientData.birthDate,
      address: [],
      contact: [],
      extension: []
    };

    // CPF (obrigatório)
    if (patientData.cpf) {
      fhirPatient.identifier.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoIdentificador',
            code: 'CPF'
          }]
        },
        system: 'http://www.saude.gov.br/fhir/r4/sid/cpf',
        value: patientData.cpf
      });
    }

    // CNS (Cartão Nacional de Saúde)
    if (patientData.cns) {
      fhirPatient.identifier.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoIdentificador',
            code: 'CNS'
          }]
        },
        system: 'http://www.saude.gov.br/fhir/r4/sid/cns',
        value: patientData.cns
      });
    }

    // Nome completo
    if (patientData.name) {
      const nameParts = patientData.name.split(' ');
      fhirPatient.name.push({
        use: 'official',
        family: nameParts[nameParts.length - 1],
        given: nameParts.slice(0, -1)
      });
    }

    // Contatos
    if (patientData.phone) {
      fhirPatient.telecom.push({
        system: 'phone',
        value: patientData.phone,
        use: 'mobile'
      });
    }

    if (patientData.email) {
      fhirPatient.telecom.push({
        system: 'email',
        value: patientData.email
      });
    }

    // Endereço
    if (patientData.address) {
      fhirPatient.address.push({
        use: 'home',
        type: 'physical',
        line: [patientData.address.street],
        city: patientData.address.city,
        state: patientData.address.state,
        postalCode: patientData.address.zipCode,
        country: 'BR',
        extension: [{
          url: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRMunicipio',
          valueCodeableConcept: {
            coding: [{
              system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRDivisaoGeograficaBrasil',
              code: patientData.address.cityCode || '3550308' // São Paulo como padrão
            }]
          }
        }]
      });
    }

    // Raça/Cor/Etnia (extensão brasileira)
    if (patientData.race) {
      fhirPatient.extension.push({
        url: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRacaCorEtnia-1.0',
        extension: [{
          url: 'race',
          valueCodeableConcept: {
            coding: [{
              system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRRacaCor',
              code: this.mapRaceCode(patientData.race)
            }]
          }
        }]
      });
    }

    return fhirPatient;
  }

  /**
   * Converte documento médico para FHIR Composition
   */
  convertDocumentToFHIR(documentData, patientId, practitionerId) {
    const fhirComposition = {
      resourceType: 'Composition',
      id: documentData.id || uuidv4(),
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['http://www.saude.gov.br/fhir/r4/StructureDefinition/BRDocumento']
      },
      identifier: {
        use: 'official',
        system: 'http://www.saude.gov.br/fhir/r4/sid/documento',
        value: documentData.id
      },
      status: 'final',
      type: {
        coding: [{
          system: 'http://loinc.org',
          code: this.mapDocumentType(documentData.type),
          display: documentData.type
        }]
      },
      category: [{
        coding: [{
          system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento',
          code: this.mapDocumentCategory(documentData.type)
        }]
      }],
      subject: {
        reference: `Patient/${patientId}`
      },
      date: documentData.date || new Date().toISOString(),
      author: [{
        reference: `Practitioner/${practitionerId}`
      }],
      title: documentData.title || `Documento médico - ${documentData.type}`,
      confidentiality: 'N',
      custodian: {
        reference: `Organization/${documentData.organizationId}`
      },
      section: []
    };

    // Seções do documento
    if (documentData.sections) {
      documentData.sections.forEach(section => {
        fhirComposition.section.push({
          title: section.title,
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: this.mapSectionCode(section.type)
            }]
          },
          text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${section.content}</div>`
          },
          entry: section.entries || []
        });
      });
    }

    return fhirComposition;
  }

  /**
   * Converte prescrição médica para FHIR MedicationRequest
   */
  convertPrescriptionToFHIR(prescriptionData, patientId, practitionerId) {
    return prescriptionData.medications.map(medication => ({
      resourceType: 'MedicationRequest',
      id: uuidv4(),
      meta: {
        profile: ['http://www.saude.gov.br/fhir/r4/StructureDefinition/BRPrescricaoMedicamento']
      },
      status: 'active',
      intent: 'order',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category',
          code: 'outpatient'
        }]
      }],
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRMedicamento',
          code: medication.code || 'unknown',
          display: medication.name
        }],
        text: medication.name
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      authoredOn: prescriptionData.date || new Date().toISOString(),
      requester: {
        reference: `Practitioner/${practitionerId}`
      },
      dosageInstruction: [{
        text: medication.dosage,
        timing: {
          repeat: {
            frequency: medication.frequency || 1,
            period: 1,
            periodUnit: 'd'
          }
        },
        route: {
          coding: [{
            system: 'http://standardterms.edqm.eu',
            code: '20053000',
            display: 'Oral use'
          }]
        },
        doseAndRate: [{
          doseQuantity: {
            value: parseFloat(medication.dose) || 1,
            unit: medication.unit || 'tablet',
            system: 'http://unitsofmeasure.org',
            code: '{tablet}'
          }
        }]
      }],
      dispenseRequest: {
        quantity: {
          value: medication.quantity || 30,
          unit: medication.unit || 'tablet',
          system: 'http://unitsofmeasure.org',
          code: '{tablet}'
        },
        expectedSupplyDuration: {
          value: medication.duration || 30,
          unit: 'days',
          system: 'http://unitsofmeasure.org',
          code: 'd'
        }
      }
    }));
  }

  /**
   * Envia recurso FHIR para RNDS
   */
  async sendToRNDS(resource, resourceType) {
    try {
      const token = await this.authenticateRNDS();
      
      const response = await axios.post(
        `${this.rndsConfig.baseUrl}/${resourceType}`,
        resource,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/fhir+json',
            'X-Authorization-Server': 'https://ehr-auth.saude.gov.br'
          },
          httpsAgent: await this.getHttpsAgent()
        }
      );

      console.log(`${resourceType} sent to RNDS successfully:`, response.data.id);
      
      return {
        success: true,
        id: response.data.id,
        versionId: response.data.meta.versionId,
        location: response.headers.location
      };

    } catch (error) {
      console.error(`Error sending ${resourceType} to RNDS:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        code: error.response?.status || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Busca recursos no RNDS
   */
  async searchRNDS(resourceType, searchParams) {
    try {
      const token = await this.authenticateRNDS();
      
      const params = new URLSearchParams(searchParams);
      const response = await axios.get(
        `${this.rndsConfig.baseUrl}/${resourceType}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/fhir+json'
          },
          httpsAgent: await this.getHttpsAgent()
        }
      );

      return {
        success: true,
        bundle: response.data,
        total: response.data.total || 0,
        entries: response.data.entry || []
      };

    } catch (error) {
      console.error(`Error searching ${resourceType} in RNDS:`, error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Sincroniza dados locais com RNDS
   */
  async syncWithRNDS(localData, resourceType) {
    try {
      const syncResults = {
        sent: 0,
        errors: [],
        successful: []
      };

      for (const item of localData) {
        let fhirResource;
        
        switch (resourceType) {
          case 'Patient':
            fhirResource = this.convertPatientToFHIR(item);
            break;
          case 'Composition':
            fhirResource = this.convertDocumentToFHIR(item, item.patientId, item.practitionerId);
            break;
          case 'MedicationRequest':
            fhirResource = this.convertPrescriptionToFHIR(item, item.patientId, item.practitionerId);
            break;
          default:
            throw new Error(`Unsupported resource type: ${resourceType}`);
        }

        const result = await this.sendToRNDS(fhirResource, resourceType);
        
        if (result.success) {
          syncResults.sent++;
          syncResults.successful.push({
            localId: item.id,
            rndsId: result.id,
            resourceType: resourceType
          });
        } else {
          syncResults.errors.push({
            localId: item.id,
            error: result.error
          });
        }

        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return syncResults;

    } catch (error) {
      console.error('Error in RNDS sync:', error);
      return {
        sent: 0,
        errors: [{ error: error.message }],
        successful: []
      };
    }
  }

  // Métodos auxiliares

  mapGender(gender) {
    const genderMap = {
      'M': 'male',
      'F': 'female',
      'masculino': 'male',
      'feminino': 'female',
      'male': 'male',
      'female': 'female'
    };
    return genderMap[gender] || 'unknown';
  }

  mapRaceCode(race) {
    const raceMap = {
      'branca': '01',
      'preta': '02',
      'parda': '03',
      'amarela': '04',
      'indigena': '05'
    };
    return raceMap[race.toLowerCase()] || '99';
  }

  mapDocumentType(type) {
    const typeMap = {
      'receita': '57833-6',
      'atestado': '28570-0',
      'laudo': '11526-1',
      'evolucao': '34109-9',
      'sumario': '34133-9'
    };
    return typeMap[type] || '34109-9';
  }

  mapDocumentCategory(type) {
    return 'clinical-document';
  }

  mapSectionCode(sectionType) {
    const sectionMap = {
      'anamnese': '10164-2',
      'exame-fisico': '29545-1',
      'diagnostico': '29308-4',
      'tratamento': '18776-5',
      'medicamentos': '10160-0'
    };
    return sectionMap[sectionType] || '55112-7';
  }

  async generateClientAssertion() {
    // Em produção, gerar JWT assinado com certificado ICP-Brasil
    return 'mock-jwt-assertion';
  }

  async getHttpsAgent() {
    // Em produção, configurar agent HTTPS com certificado ICP-Brasil
    return undefined;
  }
}

module.exports = new FHIRService();