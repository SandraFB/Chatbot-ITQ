import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, MapPin, BookOpen } from "lucide-react";

const posgrados = [
  {
    nombre: "Maestría en Ciencia de Datos",
    descripcion: "Programa especializado en análisis y procesamiento de datos",
    duracion: "4 semestres",
    modalidad: "Presencial en CIIDET",
    tipo: "Maestría",
  },
  {
    nombre: "Maestría en Ingeniería", 
    descripcion: "Dirigido a egresados de nivel licenciatura con sólida formación en ingeniería o áreas afines a las LGAC",
    duracion: "4 semestres",
    modalidad: "Presencial en CIIDET",
    tipo: "Maestría",
  },
  {
    nombre: "Maestría en Semiconductores",
    descripcion: "Línea de investigación en procesamiento y caracterización de sistemas semiconductores",
    duracion: "4 semestres",
    modalidad: "Presencial en CIIDET", 
    tipo: "Maestría",
  },
];

export default function Posgrados() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-hero text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Programas de Posgrado</h1>
        <p className="text-white/90">
          Descubre nuestras maestrías de calidad impartidas en CIIDET
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posgrados.map((posgrado, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <Badge variant="secondary">{posgrado.tipo}</Badge>
              </div>
              <CardTitle className="text-lg">{posgrado.nombre}</CardTitle>
              <CardDescription>{posgrado.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{posgrado.duracion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{posgrado.modalidad}</span>
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
            Utiliza nuestro chatbot para resolver dudas específicas sobre cualquier programa de posgrado
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
