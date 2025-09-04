import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerUploadRoutes(fastify) {

  // Upload de arquivos médicos
  fastify.post('/api/upload', {
    schema: {
      tags: ['Upload'],
      description: 'Upload de documentos médicos',
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                filename: { type: 'string' },
                originalName: { type: 'string' },
                mimeType: { type: 'string' },
                size: { type: 'number' },
                url: { type: 'string' },
                preview: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({
          type: '/errors/no-file-provided',
          title: 'No File Provided',
          status: 400,
          detail: 'Nenhum arquivo foi enviado. Selecione um arquivo para upload.',
          instance: '/api/upload',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }

      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(data.mimetype)) {
        reply.code(400);
        return {
          success: false,
          error: 'Tipo de arquivo não suportado. Tipos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF'
        };
      }

      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const buffer = await data.toBuffer();
      
      if (buffer.length > maxSize) {
        reply.code(400);
        return {
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 10MB'
        };
      }

      // Criar diretório de uploads se não existir
      const uploadsDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(data.filename);
      const uniqueFilename = `${timestamp}_${randomString}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Salvar arquivo
      await fs.writeFile(filePath, buffer);

      // Gerar metadados do arquivo
      const fileId = `file_${timestamp}_${randomString}`;
      const metadata = {
        uploadedAt: new Date().toISOString(),
        originalName: data.filename,
        size: buffer.length,
        mimeType: data.mimetype,
        checksum: require('crypto').createHash('sha256').update(buffer).digest('hex')
      };

      // Gerar preview baseado no tipo de arquivo
      let preview = '';
      
      if (data.mimetype.startsWith('image/')) {
        preview = `/api/files/${fileId}/preview`;
      } else if (data.mimetype === 'application/pdf') {
        preview = `📄 ${data.filename} (PDF - ${Math.round(buffer.length / 1024)}KB)`;
      } else if (data.mimetype.includes('word') || data.mimetype.includes('document')) {
        preview = `📝 ${data.filename} (Documento - ${Math.round(buffer.length / 1024)}KB)`;
      } else {
        preview = `📎 ${data.filename} (${Math.round(buffer.length / 1024)}KB)`;
      }

      const fileData = {
        id: fileId,
        filename: uniqueFilename,
        originalName: data.filename,
        mimeType: data.mimetype,
        size: buffer.length,
        url: `/api/files/${fileId}`,
        preview,
        metadata
      };

      // Salvar metadados em arquivo JSON (em produção usar banco de dados)
      const metadataPath = path.join(uploadsDir, `${fileId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(fileData, null, 2));

      return {
        success: true,
        data: fileData
      };

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        type: '/errors/upload-failed',
        title: 'Upload Failed',
        status: 500,
        detail: 'Erro interno do servidor ao processar upload. Tente novamente.',
        instance: '/api/upload',
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  });

  // Download de arquivos
  fastify.get('/api/files/:id', {
    schema: {
      tags: ['Upload'],
      description: 'Download de arquivo por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const metadataPath = path.join(uploadsDir, `${id}.json`);

      // Verificar se arquivo existe
      const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);
      
      if (!metadataExists) {
        reply.code(404);
        return { success: false, error: 'Arquivo não encontrado' };
      }

      // Carregar metadados
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const filePath = path.join(uploadsDir, metadata.filename);

      // Verificar se arquivo físico existe
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (!fileExists) {
        reply.code(404);
        return { success: false, error: 'Arquivo físico não encontrado' };
      }

      // Configurar headers para download
      reply.header('Content-Type', metadata.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${metadata.originalName}"`);

      // Enviar arquivo
      const fileBuffer = await fs.readFile(filePath);
      return reply.send(fileBuffer);

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, error: 'Erro ao baixar arquivo' };
    }
  });

  // Preview de arquivos (especialmente imagens)
  fastify.get('/api/files/:id/preview', {
    schema: {
      tags: ['Upload'],
      description: 'Preview de arquivo (especialmente imagens)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const metadataPath = path.join(uploadsDir, `${id}.json`);

      // Verificar se arquivo existe
      const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);
      
      if (!metadataExists) {
        reply.code(404);
        return { success: false, error: 'Arquivo não encontrado' };
      }

      // Carregar metadados
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const filePath = path.join(uploadsDir, metadata.filename);

      // Verificar se arquivo físico existe
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (!fileExists) {
        reply.code(404);
        return { success: false, error: 'Arquivo físico não encontrado' };
      }

      // Para imagens, retornar o arquivo diretamente
      if (metadata.mimeType.startsWith('image/')) {
        reply.header('Content-Type', metadata.mimeType);
        const fileBuffer = await fs.readFile(filePath);
        return reply.send(fileBuffer);
      }

      // Para outros tipos, retornar informações do arquivo
      reply.header('Content-Type', 'application/json');
      return {
        success: true,
        data: {
          id: metadata.id,
          originalName: metadata.originalName,
          mimeType: metadata.mimeType,
          size: metadata.size,
          preview: metadata.preview,
          canPreview: false,
          message: 'Preview não disponível para este tipo de arquivo'
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, error: 'Erro ao gerar preview' };
    }
  });

  // Listar arquivos enviados
  fastify.get('/api/uploads', {
    schema: {
      tags: ['Upload'],
      description: 'Lista todos os arquivos enviados',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string', description: 'Filtrar por tipo MIME' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, type } = request.query;
      const uploadsDir = path.join(__dirname, '../../uploads');

      // Verificar se diretório existe
      const dirExists = await fs.access(uploadsDir).then(() => true).catch(() => false);
      
      if (!dirExists) {
        return {
          success: true,
          data: [],
          pagination: { page, limit, total: 0, pages: 0 }
        };
      }

      // Listar arquivos JSON (metadados)
      const files = await fs.readdir(uploadsDir);
      const metadataFiles = files.filter(file => file.endsWith('.json'));

      // Carregar metadados de todos os arquivos
      const allFiles = [];
      for (const metadataFile of metadataFiles) {
        try {
          const metadataPath = path.join(uploadsDir, metadataFile);
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          allFiles.push(metadata);
        } catch (error) {
          // Ignorar arquivos com JSON inválido
          continue;
        }
      }

      // Filtrar por tipo se especificado
      let filteredFiles = allFiles;
      if (type) {
        filteredFiles = allFiles.filter(file => file.mimeType.includes(type));
      }

      // Ordenar por data de upload (mais recente primeiro)
      filteredFiles.sort((a, b) => new Date(b.metadata.uploadedAt) - new Date(a.metadata.uploadedAt));

      // Paginação
      const total = filteredFiles.length;
      const pages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedFiles = filteredFiles.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedFiles,
        pagination: { page, limit, total, pages }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, error: 'Erro ao listar arquivos' };
    }
  });

  // Excluir arquivo
  fastify.delete('/api/files/:id', {
    schema: {
      tags: ['Upload'],
      description: 'Excluir arquivo por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const metadataPath = path.join(uploadsDir, `${id}.json`);

      // Verificar se arquivo existe
      const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);
      
      if (!metadataExists) {
        reply.code(404);
        return { success: false, error: 'Arquivo não encontrado' };
      }

      // Carregar metadados para obter nome do arquivo físico
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const filePath = path.join(uploadsDir, metadata.filename);

      // Excluir arquivo físico (se existir)
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (fileExists) {
        await fs.unlink(filePath);
      }

      // Excluir metadados
      await fs.unlink(metadataPath);

      return {
        success: true,
        message: 'Arquivo excluído com sucesso'
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { success: false, error: 'Erro ao excluir arquivo' };
    }
  });
}