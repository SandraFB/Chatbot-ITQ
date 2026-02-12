import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contacto() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-hero text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Contacto</h1>
        <p className="text-white/90">
          Ponte en contacto con TecNM Campus Querétaro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Av. Tecnológico s/n</p>
            <p className="mb-2">Col. Centro</p>
            <p className="mb-4">Querétaro, Qro. C.P. 76000</p>
            <p className="text-sm text-muted-foreground">
              Muy cerca del centro histórico de la ciudad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Teléfonos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Principal:</strong> (442) 227-4400
            </p>
            <p className="mb-2">
              <strong>Servicios Escolares:</strong> (442) 227-4401
            </p>
            <p className="mb-4">
              <strong>Admisión:</strong> (442) 227-4402
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Correo Electrónico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>General:</strong> queretaro@tecnm.mx
            </p>
            <p className="mb-2">
              <strong>Admisión:</strong> admision.queretaro@tecnm.mx
            </p>
            <p className="mb-4">
              <strong>Becas:</strong> becas.queretaro@tecnm.mx
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Lunes a Viernes:</strong> 8:00 - 18:00 hrs
            </p>
            <p className="mb-2">
              <strong>Período vacacional:</strong> 8:00 - 15:00 hrs
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Para atención personalizada, te recomendamos agendar cita previa
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia Virtual 24/7</CardTitle>
          <CardDescription>
            Nuestro chatbot está disponible las 24 horas para resolver tus dudas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visita la página de <a href="/" className="text-primary hover:underline">inicio</a> para acceder al asistente virtual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}