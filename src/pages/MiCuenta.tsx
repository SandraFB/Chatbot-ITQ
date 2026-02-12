import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, User, Mail, Shield, Calendar as CalendarLucide } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserProfile {
  email: string;
  nombre_completo: string;
  role?: string;
}

const MiCuenta = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive",
        });
        return;
      }

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setProfile({
        email: profileData.email,
        nombre_completo: profileData.nombre_completo,
        role: rolesData?.role,
      });

      // Verificar si el usuario se autenticó con Google
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.app_metadata?.provider === 'google') {
        setIsGoogleConnected(true);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.readonly',
          redirectTo: `${window.location.origin}/mi-cuenta`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo conectar con Google Calendar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al conectar con Google",
        variant: "destructive",
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const getRoleBadge = (role?: string) => {
    const roleColors: Record<string, string> = {
      alumno: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      profesor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      administrativo: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const roleLabels: Record<string, string> = {
      alumno: "Alumno",
      profesor: "Profesor",
      administrativo: "Administrativo",
      admin: "Administrador",
    };

    return (
      <Badge className={roleColors[role || "alumno"]}>
        {roleLabels[role || "alumno"]}
      </Badge>
    );
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu información personal y calendario
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información del perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Detalles de tu cuenta en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nombre completo</span>
                </div>
                <p className="text-lg font-medium">{profile.nombre_completo}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Correo electrónico</span>
                </div>
                <p className="text-lg">{profile.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Rol</span>
                </div>
                <div>{getRoleBadge(profile.role)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Google Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarLucide className="h-5 w-5" />
                Google Calendar
              </CardTitle>
              <CardDescription>
                Conecta tu cuenta de Google para ver eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGoogleConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    <span>Conectado con Google Calendar</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu calendario está sincronizado con tu cuenta de Google.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Conecta tu cuenta de Google para ver y gestionar tus eventos del calendario.
                  </p>
                  <Button 
                    onClick={handleConnectGoogleCalendar}
                    className="w-full"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Conectar Google Calendar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Nota: Se requiere configurar OAuth de Google en el backend.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Fecha seleccionada: ${format(selectedDate, "PPP", { locale: es })}`
                : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={es}
            />
          </CardContent>
        </Card>

        {/* Instrucciones de configuración */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Configuración de Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium">Para habilitar la integración completa con Google Calendar:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Configurar OAuth de Google en la consola de Google Cloud</li>
              <li>Agregar las credenciales de Google en el backend</li>
              <li>Habilitar la API de Google Calendar</li>
              <li>Configurar los permisos adecuados</li>
            </ol>
            <p className="text-xs mt-4">
              El administrador del sistema debe completar esta configuración.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MiCuenta;
