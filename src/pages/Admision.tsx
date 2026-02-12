import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, FileText, HelpCircle, Mail, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Admision() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-hero text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Proceso de Admisión</h1>
        <p className="text-white/90">
          Información completa sobre el proceso de selección para ingresar al TecNM Campus Querétaro
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El Tecnológico Nacional de México campus Querétaro amplía la convocatoria para participar en el proceso de selección. Lee con atención este instructivo para que tu registro sea exitoso.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Programas Educativos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Plantel Norte</h3>
            <ul className="space-y-1 text-sm">
              <li>• Arquitectura</li>
              <li>• Ingeniería en Gestión Empresarial</li>
              <li>• Ingeniería Mecatrónica</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Plantel Centro</h3>
            <ul className="space-y-1 text-sm">
              <li>• Ingeniería Eléctrica</li>
              <li>• Ingeniería Electrónica</li>
              <li>• Ingeniería Industrial</li>
              <li>• Ingeniería en Logística</li>
              <li>• Ingeniería Mecánica</li>
              <li>• Ingeniería en Sistemas Computacionales</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proceso</CardTitle>
          <CardDescription>Expande cada sección para conocer los detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="requisitos">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Requisitos Indispensables
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Curso Propedéutico</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Duración de 10 sesiones sabatinas obligatorias (80% de asistencia mínimo) de forma virtual:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• 01 de octubre al 03 de diciembre - Si registraste y pagaste al 30 de septiembre</li>
                    <li>• 08 de octubre al 10 de diciembre - Si registraste después del 30 de septiembre</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Formularios y Evaluaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Atender solicitudes de llenado de formularios, evaluación docente, selección de segunda opción de carrera (obligatorio) y otra información durante el curso propedéutico.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Examen de Admisión</h4>
                  <p className="text-sm text-muted-foreground">Se llevará a cabo:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• 10 de diciembre - Para quienes iniciaron el 01 de octubre</li>
                    <li>• 17 de diciembre - Para quienes iniciaron el 08 de octubre</li>
                  </ul>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Es obligatorio cumplir con todos los requisitos para participar como aspirante de nuevo ingreso.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fechas">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fechas Importantes
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary">Registro</Badge>
                    <span className="text-sm">15 de agosto al 05 de octubre</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary">Pago</Badge>
                    <span className="text-sm">15 de agosto al 05 de octubre - $4,000.00</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary">Asignación Grupo 1</Badge>
                    <span className="text-sm">29-30 de septiembre (después de las 18:00 hrs)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary">Asignación Grupo 2</Badge>
                    <span className="text-sm">06-07 de octubre (después de las 18:00 hrs)</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  El pago incluye: ficha como aspirante, curso propedéutico y examen de admisión. No es reembolsable bajo ninguna circunstancia.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="registro">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proceso de Registro
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Documentos Requeridos</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• CURP</li>
                    <li>• Comprobante de domicilio</li>
                    <li>• Cuenta de correo electrónico GMAIL personal (revisar continuamente)</li>
                    <li>• Comprobante de ingresos de quien se depende económicamente</li>
                  </ul>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Importante:</strong> Escribe correctamente todos los datos, especialmente tu correo GMAIL personal. Toda la información oficial del proceso se enviará a este correo.
                  </AlertDescription>
                </Alert>
                <div>
                  <h4 className="font-semibold mb-2">Consideraciones</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Si ya fuiste aceptado e inscrito anteriormente y causaste baja, comunícate a dda_nuevoingreso@queretaro.tecnm.mx antes de registrarte</li>
                    <li>• Si tu preparatoria no aparece en la lista, notifícalo con el asunto "ALTA PREPARATORIA" incluyendo: Nombre oficial, Clave CCT, Estado y Municipio</li>
                    <li>• Conserva tu ficha de identificación, recibo de pago y comprobante bancario durante todo el proceso</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faqs">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Preguntas Frecuentes
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿No encuentro mi preparatoria en el registro?</h4>
                  <p className="text-sm text-muted-foreground">
                    Envía correo a nuevoingreso@queretaro.tecnm.mx con asunto "ALTA PREPARATORIA" incluyendo: Nombre oficial, Clave CCT, Estado y Municipio. Respuesta en 2 días hábiles.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿La ficha de pago me llegará por correo?</h4>
                  <p className="text-sm text-muted-foreground">
                    No, la generas tú al guardar el registro. Si no lo hiciste, accede con tu número de registro y elige "IMPRIMIR FICHA".
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿No imprimí mi ficha de pago?</h4>
                  <p className="text-sm text-muted-foreground">
                    Accede con tu número de registro en "¿YA TE REGISTRASTE? CONSULTA TUS DATOS AQUÍ" y elige "IMPRIMIR FICHA".
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿Olvidé mi número de registro?</h4>
                  <p className="text-sm text-muted-foreground">
                    Deberás volver a registrarte.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿Escribí mal mi nombre?</h4>
                  <p className="text-sm text-muted-foreground">
                    Envía correo a dda_nuevoingreso@queretaro.tecnm.mx con asunto "CORRECCIÓN DE NOMBRE" anexando comprobante de pago.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿Escribí mal mi correo electrónico?</h4>
                  <p className="text-sm text-muted-foreground">
                    Envía correo con tu nombre completo, número de solicitud (11 dígitos, empieza con 22) y carrera, especificando el error.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">¿No he recibido información?</h4>
                  <p className="text-sm text-muted-foreground">
                    Revisa la carpeta de spam. Si no hay información, envía correo con asunto "NO TENGO INFORMACION".
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacidad">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Aviso de Privacidad
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  El Tecnológico Nacional de México, campus Querétaro con domicilio en Av. Tecnológico esquina Mariano Escobedo s/n, Col. Centro, Querétaro, Qro., es responsable del tratamiento de tu información personal y académica.
                </p>
                <p className="font-semibold">La información será utilizada para:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Proceso de selección desde pre-registro hasta publicación de resultados</li>
                  <li>• Invitación a otras opciones educativas para aspirantes no aceptados</li>
                  <li>• Los puntajes individuales son privados (excepto por situaciones académicas específicas)</li>
                  <li>• Asignación a segunda opción de carrera según disponibilidad</li>
                  <li>• El pago no es reembolsable bajo ninguna circunstancia</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contacto
          </CardTitle>
          <CardDescription>Formato para enviar dudas por correo electrónico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            <strong>Correo:</strong> dda_nuevoingreso@queretaro.tecnm.mx
          </p>
          <div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
            <p className="font-semibold">Formato del mensaje:</p>
            <p><strong>Asunto:</strong> Título del mensaje (ej: NO TENGO INFORMACION, ALTA PREPARATORIA)</p>
            <p><strong>Cuerpo del mensaje debe incluir:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Nombre completo</li>
              <li>• No. de solicitud (11 dígitos, empieza con 22)</li>
              <li>• Carrera de primera y segunda opción</li>
              <li>• Descripción del asunto a tratar</li>
            </ul>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este es el único medio oficial para ingresar. Evita fraudes y denuncia a quien te ofrezca ayuda a cambio de dinero.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas más información?</CardTitle>
          <CardDescription>
            Utiliza nuestro chatbot para resolver dudas específicas sobre el proceso de admisión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Regresa al <a href="/" className="text-primary hover:underline">inicio</a> para chatear con nuestro asistente virtual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
