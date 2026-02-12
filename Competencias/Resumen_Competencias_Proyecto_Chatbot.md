# COMPETENCIAS IDENTIFICADAS PARA EL PROYECTO DE CHATBOT RAG

## Fecha: Febrero 2026
## Proyecto: Agente de Asistencia Informativa del TecNM Campus Querétaro

---

## ATRIBUTOS DE EGRESO (AE) APLICADOS

### AE1: Implementa aplicaciones computacionales

**Descripción completa:**
Implementa aplicaciones computacionales para solucionar problemas de diversos contextos, integrando diferentes tecnologías, plataformas o dispositivos.

**Aplicación en el proyecto:**
- Desarrollo de aplicación web del chatbot que integra múltiples tecnologías
- Stack tecnológico: Python, FastAPI, React, ChromaDB, GPT-3.5-turbo
- Integración de componentes: frontend, backend, base de datos vectorial, modelo LLM
- Despliegue en plataforma cloud (AWS)

**Evidencias:**
- Chatbot web funcional en chatbot.itq.edu.mx
- Código fuente completo documentado
- Sistema operativo 24/7 con 99.2% de disponibilidad

---

### AE2: Diseña, desarrolla y aplica modelos computacionales

**Descripción completa:**
Diseña, desarrolla y aplica modelos computacionales para solucionar problemas, mediante la selección y uso de herramientas matemáticas.

**Aplicación en el proyecto:**
- Implementación de pipeline RAG (Retrieval-Augmented Generation)
- Procesamiento de lenguaje natural con modelos de embeddings
- Búsqueda semántica usando similitud coseno
- Vectorización de texto (768 dimensiones)
- Algoritmos de ranking y re-ranking de resultados

**Evidencias:**
- Código del módulo RAG con documentación técnica
- Base de datos vectorial con 543 documentos indexados
- Métricas de evaluación: Precision 92.4%, Recall 88.7%
- Framework RAGAS: Faithfulness 0.91, Answer Relevancy 0.87

---

### AE4: Coordina y participa en equipos multidisciplinarios

**Descripción completa:**
Coordina y participa en equipos multidisciplinarios para la aplicación de soluciones innovadoras en diferentes contextos.

**Aplicación en el proyecto:**
- Colaboración con asesor académico (reuniones quincenales)
- Coordinación con personal de Servicios Escolares para requisitos
- Trabajo con usuarios piloto (20 participantes) para pruebas
- Coordinación con Departamento de TI para despliegue
- Validación de contenidos con distintos departamentos académicos

**Evidencias:**
- Minutas de reuniones con asesor
- Encuestas de validación con usuarios piloto
- Documentación de requisitos con stakeholders
- Acuerdos de colaboración con TI institucional

---

### AE5: Diseña, implementa y administra bases de datos

**Descripción completa:**
Diseña, implementa y administra bases de datos optimizando los recursos disponibles, conforme a las normas vigentes de manejo y seguridad de la información.

**Aplicación en el proyecto:**
- Diseño de esquema de base de datos vectorial (ChromaDB)
- Implementación de índice de búsqueda semántica
- Gestión de 543 documentos institucionales indexados
- Optimización de consultas (tiempo promedio: 3.2 segundos)
- Implementación de índice BM25 complementario
- Seguridad de datos institucionales

**Evidencias:**
- Esquema de base de datos documentado
- Scripts de indexación y actualización
- Análisis de tiempos de consulta y optimización
- Procedimientos de backup y recuperación

---

### AE6: Desarrolla y administra software

**Descripción completa:**
Desarrolla y administra software para apoyar la productividad y competitividad de las organizaciones cumpliendo con estándares de calidad.

**Aplicación en el proyecto:**
- Gestión completa del ciclo de desarrollo (análisis, diseño, implementación, pruebas, despliegue)
- Metodología ágil con iteraciones de 2-3 semanas
- Control de versiones con Git/GitHub
- Documentación técnica completa
- Evaluación de calidad con métricas estándar (RAGAS, SUS)
- Manuales de usuario y administrador

**Evidencias:**
- Cronograma de actividades cumplido
- Repositorio Git con historial completo
- Documento de requisitos funcionales y no funcionales
- Informe de evaluación con métricas
- Manuales técnicos (55 páginas totales)
- Puntaje SUS: 72.5/100

---

### AE7: Evalúa tecnologías de hardware

**Descripción completa:**
Evalúa tecnologías de hardware para soportar aplicaciones de manera efectiva.

**Aplicación en el proyecto:**
- Evaluación de plataformas cloud: AWS vs Google Cloud Platform
- Selección de tipo de instancia EC2 adecuada
- Configuración de recursos (CPU, RAM, almacenamiento)
- Análisis costo-beneficio de opciones de infraestructura
- Dimensionamiento para soportar carga esperada

**Evidencias:**
- Análisis comparativo de plataformas cloud
- Documentación de configuración de servidor
- Análisis de performance y capacidad
- Presupuesto de infraestructura

---

## ASIGNATURAS DEL PLAN DE ESTUDIOS INVOLUCRADAS

### 1. Inteligencia Artificial
**Competencias aplicadas:**
- Implementación de técnicas de procesamiento de lenguaje natural
- Integración de modelos de lenguaje (LLMs)
- Diseño y aplicación de pipeline RAG
- Optimización de prompts

### 2. Fundamentos de Bases de Datos / Administración de BD
**Competencias aplicadas:**
- Diseño e implementación de base de datos vectorial
- Gestión de documentos institucionales
- Optimización de consultas y búsqueda semántica

### 3. Programación Web / Tópicos Avanzados de Programación
**Competencias aplicadas:**
- Desarrollo de interfaz web responsiva (React)
- Implementación de API REST (FastAPI)
- Integración frontend-backend

### 4. Programación Orientada a Objetos
**Competencias aplicadas:**
- Diseño de arquitectura modular
- Implementación de patrones de diseño (MVC, Factory, Strategy)
- Estructuración del código en clases reutilizables

### 5. Gestión de Proyectos de Software
**Competencias aplicadas:**
- Planificación y seguimiento de actividades
- Gestión de requisitos y alcance
- Control de calidad y evaluación de desempeño
- Documentación del proyecto

### 6. Redes de Computadoras / Administración de Redes
**Competencias aplicadas:**
- Configuración de subdominio institucional
- Implementación de protocolos HTTP/HTTPS
- Despliegue en servidores cloud

### 7. Sistemas Operativos
**Competencias aplicadas:**
- Administración de servidores Linux (Ubuntu)
- Gestión de procesos y servicios del sistema
- Configuración de entornos de desarrollo y producción

---

## OBJETIVO EDUCACIONAL CUMPLIDO

**OE1:** Los egresados tienen una sólida formación ingenieril, que les permite resolver problemas de las organizaciones, implementando soluciones tecnológicas, acorde a su entorno en un contexto global multidisciplinario y sostenible.

**Evidencia de cumplimiento:**
El proyecto demuestra la capacidad de resolver un problema real institucional (acceso ineficiente a información) mediante la implementación de una solución tecnológica innovadora (chatbot RAG) que integra múltiples disciplinas (IA, bases de datos, desarrollo web, redes) en un contexto organizacional (TecNM Campus Querétaro), mejorando la productividad y competitividad de la institución.

**OE2:** Los egresados diseñan y administran tecnologías, optimizando los recursos disponibles, conforme a las normas vigentes de manejo y seguridad de la información, aplicando las tecnologías de la información y comunicación con una visión empresarial, cumpliendo con estándares de calidad.

**Evidencia de cumplimiento:**
El proyecto incluye optimización de recursos (base de datos eficiente, tiempos de respuesta < 5 seg), seguridad de información institucional, y cumplimiento de estándares de calidad medidos objetivamente (métricas RAGAS, SUS).

---

## RESUMEN CUANTITATIVO

- **Total de AE aplicados:** 6 de 7 disponibles (85.7%)
- **Asignaturas integradas:** 7 asignaturas del plan de estudios
- **Objetivos Educacionales cumplidos:** 2 de 4 (50%)
- **Competencias específicas desarrolladas:** 25+ competencias individuales

---

## CONCLUSIÓN

El proyecto "Agente de Asistencia Informativa del TecNM Campus Querétaro" demuestra una integración efectiva y sustancial de competencias del plan de estudios de Ingeniería en Sistemas Computacionales, cumpliendo ampliamente con los requisitos de un Proyecto Integrador según el lineamiento institucional.

La naturaleza multidisciplinaria del proyecto, que requiere la aplicación simultánea de conocimientos de Inteligencia Artificial, Bases de Datos, Desarrollo Web, Programación Orientada a Objetos, Gestión de Proyectos, Redes y Sistemas Operativos, evidencia la integración horizontal de competencias necesaria para abordar problemas complejos del ejercicio profesional.

Los resultados obtenidos (métricas técnicas superiores a objetivos, satisfacción de usuarios, impacto operacional medible) validan tanto la calidad técnica del proyecto como la efectividad de la integración de competencias lograda.

---

**Documento generado:** Febrero 2026  
**Proyecto:** Agente de Asistencia Informativa del TecNM Campus Querétaro  
**Modalidad de titulación:** Proyecto Integrador  
**Carrera:** Ingeniería en Sistemas Computacionales
