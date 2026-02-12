import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Users, BookOpen, Phone, Mail, Clock, MapPin, ExternalLink, HelpCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Becas = () => {
  const materialesApoyo = [
    "¿Cómo solicitar una beca?",
    "¿Cómo me registro en SUBES?",
    "¿Cómo activar mi ficha escolar?",
    "¿Cómo recupero mi contraseña?",
    "¿Cómo cambio mi correo electrónico?",
    "¿Cómo abrir una cuenta bancaria?",
    "¿Qué requisitos debe tener mi cuenta bancaria?",
    "¿Qué es y cómo capturo mi clave interbancaria?",
    "Manual de usuario SUBES"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Becas</h1>
          <p className="text-lg opacity-90 max-w-3xl">
            Oficina de Becas y Seguro Facultativo - Departamento de Servicios Escolares
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <GraduationCap className="h-5 w-5 text-primary" />
          <AlertDescription className="text-foreground">
            La oficina de Becas y Seguro Facultativo les da una cordial bienvenida. Les ofrecemos asesoría y seguimiento en los diferentes programas de becas disponibles.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Jóvenes Escribiendo el Futuro */}
          <AccordionItem value="jovenes-escribiendo" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-semibold">Jóvenes Escribiendo el Futuro</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-muted-foreground">
              <p>
                El tipo de cobertura de la beca es focalizada, en una primera etapa se dará prioridad a normales rurales, 
                universidades interculturales y agrarias, así como a las Universidades Benito Juárez. En colaboración con 
                la UNAM, el IPN, la UPN y el TecNM, también se apoyará a jóvenes de escasos recursos con becas de 
                manutención, transporte, prácticas profesionales y continuación de estudios.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Propósito</h4>
                <p>
                  Contribuir al bienestar social e igualdad mediante el otorgamiento de becas para la permanencia y 
                  terminación escolar de las alumnas y alumnos en condición de pobreza o vulnerabilidad, que vivan en 
                  zonas con altos índices de violencia, así como a estudiantes de origen indígena y afrodescendientes.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Dirigida a</h4>
                <p>
                  Mujeres y hombres de hasta 29 años de edad al momento de ser censados, que estén inscritos en alguna 
                  institución de educación pública de modalidad escolarizada.
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Material de apoyo para tu registro en SUBES
                </h4>
                <ul className="grid gap-2">
                  {materialesApoyo.map((material, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Becas Elisa Acuña */}
          <AccordionItem value="elisa-acuna" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">Becas Elisa Acuña</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-muted-foreground">
              <p>
                A partir de enero de 2020, las becas de Educación Superior que operaba la Secretaría de Educación 
                Pública a través de la Coordinación Nacional de Becas (CNBES) pasan a formar parte del Programa 
                Nacional de Becas para el Bienestar Benito Juárez, con el nombre Becas Elisa Acuña.
              </p>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Objetivo</h4>
                <p>
                  Este conjunto de becas tiene una naturaleza diferente a la del programa Jóvenes Escribiendo el Futuro, 
                  ya que se otorgan tanto a estudiantes que cursan sus estudios superiores, como a aquellos que los 
                  concluyeron recientemente. Las Becas Elisa Acuña tienen como fin impulsar a quienes desean continuar 
                  su formación académica o profesionalización docente, hacer su servicio social, realizar estudios en 
                  el extranjero, e iniciar o concluir su titulación.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Proceso de postulación</h4>
                <p>
                  Los estudiantes deben revisar la publicación de las distintas convocatorias y cada Instituto 
                  Tecnológico postulará a los beneficiarios que cumplan con los requisitos a través de la plataforma SUBES.
                </p>
                <a 
                  href="http://subes.becasbenitojuarez.gob.mx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
                >
                  Ir a plataforma SUBES <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Modalidades</h4>
                <p>
                  Las diversas modalidades de las Becas Elisa Acuña acompañan la trayectoria académica del estudiante 
                  desde que ingresa hasta que concluye su Educación Superior, considerando apoyos complementarios para:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Servicio social</li>
                  <li>Titulación</li>
                  <li>Movilidad nacional e internacional</li>
                  <li>Capacitación y prácticas profesionales</li>
                  <li>Profesionalización de docentes</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <a 
                  href="https://www.gob.mx/becasbenitojuarez/articulos/becas-elisa-acuna/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Más información <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contacto */}
          <AccordionItem value="contacto" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">Información de Contacto</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Encargada de Oficina</CardTitle>
                  <CardDescription>Alma Kenia Martínez Bocanegra</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Av. Tecnológico s/n esq. Gral. Mariano Escobedo. Colonia Centro Histórico C.P. 76000, Querétaro, Querétaro.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">(442) 2274400 Extensión: 4404</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href="mailto:dse_becas@queretaro.tecnm.mx" className="text-sm text-primary hover:underline">
                      dse_becas@queretaro.tecnm.mx
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Lunes a Viernes de 8:00 a 13:00 hrs</p>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA Card */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">¿Tienes más preguntas sobre becas?</CardTitle>
            <CardDescription>
              Nuestro chatbot puede ayudarte con información adicional sobre requisitos, fechas y trámites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button>
                <GraduationCap className="h-4 w-4 mr-2" />
                Consultar con el Asistente Virtual
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Becas;
