import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, MapPin } from "lucide-react";

const carreras = [
  {
    nombre: "Ingeniería Industrial",
    descripcion: "Optimización de procesos y sistemas productivos",
    duracion: "9 semestres",
    modalidad: "Presencial",
    acreditacion: "CACEI",
  },
  {
    nombre: "Ingeniería en Sistemas Computacionales", 
    descripcion: "Desarrollo de software y administración de sistemas",
    duracion: "9 semestres",
    modalidad: "Presencial",
    acreditacion: "CACEI",
  },
  {
    nombre: "Ingeniería Mecánica",
    descripcion: "Diseño y manufactura de sistemas mecánicos",
    duracion: "9 semestres", 
    modalidad: "Presencial",
    acreditacion: "CACEI",
  },
  {
    nombre: "Ingeniería Electrónica",
    descripcion: "Sistemas electrónicos y telecomunicaciones",
    duracion: "9 semestres",
    modalidad: "Presencial", 
    acreditacion: "CACEI",
  },
  {
    nombre: "Ingeniería en Gestión Empresarial",
    descripcion: "Administración y emprendimiento empresarial",
    duracion: "9 semestres",
    modalidad: "Presencial",
    acreditacion: "CACEI",
  },
];

export default function Carreras() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-hero text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Carreras de Ingeniería</h1>
        <p className="text-white/90">
          Descubre nuestras carreras de ingeniería con reconocimiento de calidad CACEI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carreras.map((carrera, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <Badge variant="secondary">{carrera.acreditacion}</Badge>
              </div>
              <CardTitle className="text-lg">{carrera.nombre}</CardTitle>
              <CardDescription>{carrera.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{carrera.duracion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{carrera.modalidad}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas más información?</CardTitle>
          <CardDescription>
            Utiliza nuestro chatbot para resolver dudas específicas sobre cualquier carrera
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