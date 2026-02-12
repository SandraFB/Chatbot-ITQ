# Chatbot-ITQ
[pipeline_descripcion.md](https://github.com/user-attachments/files/25271660/pipeline_descripcion.md)
# Pipeline del Chatbot RAG Institucional
## TecNM Campus Querétaro

---

## DESCRIPCIÓN GENERAL

El pipeline del chatbot RAG (Retrieval-Augmented Generation) institucional está diseñado para proporcionar respuestas precisas y fundamentadas a las consultas de estudiantes y personal del TecNM Campus Querétaro. El sistema combina recuperación de información con generación de lenguaje natural para ofrecer asistencia 24/7.

---

## FASE 1: PREPARACIÓN DE DATOS

### 1.1 Documentos Institucionales (Entrada)
- **Fuentes de datos:**
  - Reglamentos académicos y administrativos
  - Preguntas frecuentes (FAQs)
  - Manuales del estudiante
  - Calendarios académicos
  - Directorio de departamentos
  - Guías de servicios estudiantiles

### 1.2 Procesamiento de Documentos
- **Actividades:**
  - Parseo de archivos PDF, Word, HTML
  - Extracción de texto estructurado
  - Limpieza de datos (eliminación de elementos no textuales)
  - Segmentación en chunks (fragmentos) manejables
  - Preservación de metadatos (título, fecha, sección, fuente)

### 1.3 Vectorización (Embeddings)
- **Proceso:**
  - Utilización de modelos de embeddings (ej. nomic-embed, OpenAI embeddings, GTE)
  - Conversión de texto a representaciones vectoriales
  - Captura del significado semántico de cada fragmento
  - Generación de vectores de alta dimensionalidad (768-1536 dimensiones típicamente)

**Tecnologías sugeridas:** Python, PyPDF2, LangChain, sentence-transformers

---

## FASE 2: INDEXACIÓN Y ALMACENAMIENTO

### 2.1 Base de Datos Vectorial
- **Propósito:** Almacenamiento y búsqueda eficiente de embeddings
- **Opciones de implementación:**
  - **FAISS** (Facebook AI Similarity Search): Alta velocidad, uso local
  - **ChromaDB**: Open-source, fácil integración
  - **Qdrant**: Escalable, búsqueda avanzada
  - **Pinecone**: Servicio en la nube (si se permite)
- **Funcionalidad:**
  - Búsqueda semántica por similitud coseno
  - Recuperación de Top-K documentos más relevantes
  - Indexación ANN (Approximate Nearest Neighbors)

### 2.2 Índice BM25 (Opcional - Búsqueda Híbrida)
- **Propósito:** Complementar búsqueda semántica con búsqueda léxica
- **Ventajas:**
  - Mejor rendimiento en búsquedas de términos específicos
  - Combinación con búsqueda vectorial mejora recall
  - Útil para nombres propios, códigos, fechas exactas
- **Implementación:** Elasticsearch, Whoosh, o implementación custom

**Estrategia recomendada:** Sistema híbrido que combina búsqueda semántica (70%) + BM25 (30%) con re-ranking final

---

## FASE 3: INTERACCIÓN DEL USUARIO

### 3.1 Usuario (Entrada del Sistema)
- **Tipos de usuarios:**
  - Estudiantes (preguntando sobre trámites, requisitos, fechas)
  - Personal administrativo (consultando procedimientos)
  - Docentes (buscando información institucional)
- **Tipos de consultas:**
  - Consultas informativas ("¿Cuándo inicia el período de inscripciones?")
  - Consultas procedimentales ("¿Qué requisitos necesito para titularme?")
  - Consultas de navegación ("¿Dónde está el departamento de X?")

### 3.2 Interfaz Web
- **Componentes frontend:**
  - Cuadro de chat interactivo
  - Entrada de texto con soporte multilingüe (español prioritario)
  - Historial de conversación
  - Indicadores visuales (escribiendo, pensando, error)
  - Diseño responsivo (móvil, tablet, desktop)
- **Tecnologías sugeridas:** React, Vue.js, HTML5/CSS3/JavaScript, Tailwind CSS

### 3.3 API Backend
- **Funciones:**
  - Recepción de consultas desde frontend
  - Orquestación del flujo RAG completo
  - Manejo de sesiones y contexto conversacional
  - Control de errores y excepciones
  - Validación de entrada (prevención de prompt injection)
- **Tecnologías sugeridas:** FastAPI, Flask, Node.js + Express
- **Arquitectura:** RESTful API o WebSockets para respuestas en tiempo real

---

## FASE 4: RECUPERACIÓN (RETRIEVAL)

### 4.1 Procesamiento de Consulta
- **Actividades:**
  - Normalización del texto (minúsculas, eliminación de acentos si necesario)
  - Corrección ortográfica básica
  - Identificación de intención (clasificación de tipo de pregunta)
  - Vectorización de la consulta usando el mismo modelo de embeddings
  - Expansión de consulta (opcional: añadir sinónimos o términos relacionados)

### 4.2 Sistema de Recuperación
- **Proceso:**
  1. Búsqueda de similitud en base vectorial
  2. Recuperación de Top-K documentos (K típicamente 3-10)
  3. (Opcional) Búsqueda complementaria en índice BM25
  4. Combinación y re-ranking de resultados
  5. Filtrado por umbral de relevancia
- **Métricas de evaluación:**
  - Precision@K
  - Recall@K
  - MRR (Mean Reciprocal Rank)

### 4.3 Documentos Recuperados
- **Salida:**
  - Lista de fragmentos más relevantes con sus metadatos
  - Scores de relevancia para cada fragmento
  - Referencias a documentos fuente
  - Contexto adicional si es necesario

**Optimización clave:** Balance entre cantidad de contexto (más tokens = más costo/latencia) vs calidad de la respuesta

---

## FASE 5: GENERACIÓN DE RESPUESTA

### 5.1 Construcción de Prompt
- **Componentes del prompt:**
  ```
  [INSTRUCCIONES DEL SISTEMA]
  Eres un asistente virtual del TecNM Campus Querétaro...
  
  [CONTEXTO RECUPERADO]
  Documento 1: [texto relevante]
  Documento 2: [texto relevante]
  ...
  
  [PREGUNTA DEL USUARIO]
  Usuario: [consulta original]
  
  [DIRECTRICES DE RESPUESTA]
  - Responde basándote SOLO en el contexto proporcionado
  - Cita las fuentes cuando sea relevante
  - Si la información no está en el contexto, indícalo claramente
  - Usa un tono formal pero amigable
  ```

### 5.2 Modelo de Lenguaje (LLM)
- **Opciones de modelos:**
  - **GPT-3.5/4** (OpenAI): Alta calidad, requiere API
  - **Claude** (Anthropic): Excelente comprensión y seguimiento de instrucciones
  - **LLaMA 2/3** (Meta): Open-source, puede ejecutarse localmente
  - **Mistral**: Open-source, buen balance calidad/velocidad
- **Parámetros clave:**
  - Temperature (0.0-0.3 para respuestas factuales)
  - Max tokens (500-1000 típicamente)
  - Top-p, frequency penalty (para control de diversidad)
- **Control de calidad:**
  - Prevención de alucinaciones mediante ground-truth en prompt
  - Instrucciones claras de no inventar información
  - Verificación de que la respuesta se basa en el contexto

### 5.3 Post-procesamiento y Validación
- **Actividades:**
  - Formateo de la respuesta (markdown, listas, énfasis)
  - Adición de citas y referencias a documentos fuente
  - Verificación de longitud apropiada
  - Detección de posibles respuestas problemáticas
  - Sanitización de salida (prevención de XSS si se muestra HTML)

---

## FASE 6: PRESENTACIÓN AL USUARIO

### 6.1 Respuesta al Usuario
- **Elementos de la respuesta:**
  - Texto principal en lenguaje natural
  - Referencias a documentos consultados
  - Enlaces a recursos adicionales (opcional)
  - Sugerencias de preguntas relacionadas (opcional)
  - Indicador de confianza (opcional)

### 6.2 Visualización en Interfaz Web
- **Características:**
  - Renderizado de respuesta con formato enriquecido
  - Animación de "escritura" para mejor UX
  - Botones de feedback (útil/no útil)
  - Opción de copiar respuesta
  - Historial de conversación persistente
- **Mejoras de UX:**
  - Tiempo de respuesta visible
  - Manejo elegante de errores
  - Modo offline/mantenimiento
  - Accesibilidad (WCAG compliance)

---

## COMPONENTES TRANSVERSALES

### Seguridad
- **Control de acceso:**
  - Autenticación de usuarios (opcional, según requerimientos)
  - Rate limiting para prevenir abuso
  - Protección contra inyección de prompts maliciosos
  - Validación y sanitización de entradas
- **Protección de datos:**
  - Encriptación de datos sensibles en tránsito (HTTPS)
  - No almacenamiento de información personal sin consentimiento
  - Cumplimiento con políticas institucionales de privacidad
  - Anonimización de logs si es necesario

### Monitoreo y Análisis
- **Logging:**
  - Registro de todas las consultas (para análisis y mejora)
  - Tracking de errores y excepciones
  - Monitoreo de performance (latencia, throughput)
- **Métricas RAG:**
  - **Faithfulness:** ¿La respuesta es fiel al contexto?
  - **Answer Relevancy:** ¿La respuesta es relevante a la pregunta?
  - **Context Precision:** ¿Los documentos recuperados son precisos?
  - **Context Recall:** ¿Se recuperó toda la información necesaria?
- **Framework:** RAGAS para evaluación automatizada

### Evaluación de Calidad
- **Métricas técnicas:**
  - Precision y Recall de recuperación
  - Tiempo de respuesta promedio (latencia)
  - Tasa de éxito de respuestas
- **Métricas de usuario:**
  - System Usability Scale (SUS)
  - Net Promoter Score (NPS)
  - Encuestas de satisfacción
  - Feedback cualitativo

### Mejora Continua
- **Fuentes de mejora:**
  - Análisis de preguntas sin respuesta satisfactoria
  - Feedback directo de usuarios
  - Revisión periódica de métricas RAGAS
  - Incorporación de nuevos documentos institucionales
- **Proceso iterativo:**
  1. Recolección de datos de uso
  2. Identificación de brechas de conocimiento
  3. Actualización de base de documentos
  4. Re-entrenamiento o ajuste de embeddings si necesario
  5. Validación de mejoras
  6. Despliegue de nueva versión

---

## INFRAESTRUCTURA Y TECNOLOGÍAS

### Stack Tecnológico Propuesto

**Backend:**
- Python 3.9+ (lenguaje principal)
- FastAPI o Flask (framework web)
- LangChain (orquestación RAG)
- HuggingFace Transformers (modelos)

**Base de Datos:**
- ChromaDB o FAISS (vectorial)
- PostgreSQL (metadatos, logs)

**Frontend:**
- React o Vue.js
- Tailwind CSS
- Axios para API calls

**LLM:**
- OpenAI GPT-4 (API) o
- LLaMA 2 local (on-premise)

**Infraestructura:**
- AWS / Google Cloud Platform
- Docker para containerización
- Nginx como reverse proxy

**DevOps:**
- Git/GitHub para control de versiones
- CI/CD con GitHub Actions
- Monitoring con Prometheus + Grafana

---

## MÉTRICAS DE ÉXITO DEL PROYECTO

### Métricas Técnicas
- **Precisión de recuperación:** ≥ 90%
- **Fidelidad de respuestas (RAGAS):** ≥ 0.85
- **Tiempo de respuesta:** < 5 segundos
- **Disponibilidad del sistema:** ≥ 99%

### Métricas de Negocio
- **Satisfacción del usuario (SUS):** ≥ 70/100
- **Reducción de consultas manuales:** 30-50%
- **Cobertura de preguntas:** ≥ 80% de FAQs respondidas correctamente
- **Adopción:** 500+ consultas en primer mes

---

## CRONOGRAMA DE IMPLEMENTACIÓN

**Mes 1-2:** Preparación de datos y configuración de infraestructura  
**Mes 3:** Implementación del módulo de recuperación  
**Mes 4:** Integración con LLM y desarrollo de frontend  
**Mes 5:** Pruebas, evaluación y ajustes  
**Mes 6:** Despliegue y documentación final

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Alucinaciones del LLM | Media | Alto | Prompts estrictos, validación, umbral de confianza |
| Baja calidad de recuperación | Media | Alto | Sistema híbrido, tuning de embeddings, evaluación continua |
| Costo de API elevado | Baja | Medio | Uso de modelo local, caching de respuestas, rate limiting |
| Datos institucionales desactualizados | Alta | Medio | Proceso de actualización periódica documentado |
| Sobrecarga del servidor | Baja | Alto | Escalamiento horizontal, CDN, optimización de código |

---

## CONCLUSIÓN

Este pipeline representa una arquitectura completa y robusta para un chatbot RAG institucional que combina las mejores prácticas de recuperación de información, procesamiento de lenguaje natural y experiencia de usuario. La implementación modular permite iteraciones y mejoras continuas basadas en datos reales de uso.

**Próximos pasos:**
1. Validar arquitectura con stakeholders
2. Iniciar fase de preparación de datos
3. Configurar entorno de desarrollo
4. Desarrollar MVP con funcionalidad básica
5. Expandir capacidades iterativamente

