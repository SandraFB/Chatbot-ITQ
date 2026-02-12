import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileText, Users, MessageSquare, AlertCircle, Loader2, Trash2, CheckCircle, Clock, XCircle, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportToPDF, exportToExcel } from "@/utils/reportExport";

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  user_id: string;
  profiles?: {
    nombre_completo: string;
    email: string;
  };
}

interface ChatLog {
  id: string;
  message: string;
  response: string;
  tokens_used: number;
  response_time_ms: number;
  status: string;
  created_at: string;
  profiles?: {
    nombre_completo: string;
    email: string;
  };
}

interface Analytics {
  total_chats: number;
  successful_chats: number;
  failed_chats: number;
  avg_response_time: number;
  unique_users: number;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      checkAdminRole();
    }
  }, [user, authLoading, navigate]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadAllDocuments();
      loadChatLogs();
      loadAnalytics();
    } catch (error) {
      console.error("Error checking admin role:", error);
      navigate("/");
    }
  };

  const loadChatLogs = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from("chat_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      const userIds = [...new Set(logsData?.map((log) => log.user_id).filter(Boolean) || [])];
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nombre_completo, email")
        .in("id", userIds);

      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { nombre_completo: p.nombre_completo, email: p.email }]) || []
      );

      const logsWithProfiles = logsData?.map((log) => ({
        ...log,
        profiles: log.user_id ? profilesMap.get(log.user_id) : undefined,
      })) || [];

      setChatLogs(logsWithProfiles as any);
    } catch (error) {
      console.error("Error loading chat logs:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc("get_chat_analytics");

      if (error) throw error;
      if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadAllDocuments = async () => {
    try {
      // Get all documents
      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;

      // Get unique user IDs
      const userIds = [...new Set(docsData?.map((doc) => doc.user_id) || [])];

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nombre_completo, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { nombre_completo: p.nombre_completo, email: p.email }]) || []
      );

      // Merge documents with profiles
      const documentsWithProfiles = docsData?.map((doc) => ({
        ...doc,
        profiles: profilesMap.get(doc.user_id),
      })) || [];

      setDocuments(documentsWithProfiles as any);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/markdown",
        "text/html",
        "text/csv",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no soportado",
          description: "Por favor, selecciona un archivo PDF, DOCX, XLSX, CSV, TXT, MD o HTML",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El tamaño máximo es 20MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      // 1) Subir a storage
      const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile, { contentType: selectedFile.type });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast({
          title: "Error al subir a storage",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      // 2) Insertar registro en documents
      const insertPayload = {
        user_id: user.id,
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        storage_path: filePath,
        status: "pending" as const,
      };

      const { data: document, error: insertError } = await supabase
        .from("documents")
        .insert(insertPayload)
        .select()
        .maybeSingle();

      if (insertError || !document) {
        console.error("DB insert error:", insertError);
        toast({
          title: "Error al registrar documento",
          description: insertError?.message || "No se pudo crear el registro",
          variant: "destructive",
        });
        // Limpieza: eliminar archivo subido si el insert falla
        await supabase.storage.from("documents").remove([filePath]);
        return;
      }

      toast({ title: "Documento cargado", description: "Procesando documento..." });

      // 3) Invocar función de procesamiento
      const { error: processError, data: processData } = await supabase.functions.invoke(
        "process-document",
        { body: { document_id: document.id } }
      );

      if (processError) {
        console.error("Process function error:", processError, processData);
        toast({
          title: "Error al procesar",
          description: processError.message || "El documento se cargó pero hubo un error al procesarlo",
          variant: "destructive",
        });
      } else {
        toast({ title: "Procesamiento iniciado", description: "El documento está siendo procesado." });
      }

      setSelectedFile(null);
      loadAllDocuments();
    } catch (error: any) {
      console.error("Upload flow error:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cargar el documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    try {
      await supabase.storage.from("documents").remove([doc.storage_path]);
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });

      loadAllDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(analytics, chatLogs, documents);
      toast({
        title: "PDF generado",
        description: "El reporte se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(analytics, chatLogs, documents);
      toast({
        title: "Excel generado",
        description: "El reporte se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el Excel",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = {
    totalDocuments: documents.length,
    processedDocuments: documents.filter((d) => d.status === "processed").length,
    pendingDocuments: documents.filter((d) => d.status === "pending").length,
    totalSize: formatFileSize(documents.reduce((acc, doc) => acc + doc.file_size, 0)),
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona documentos y recursos del sistema
          </p>
          
          {/* Export Buttons */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">En el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Procesados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processedDocuments}</div>
              <p className="text-xs text-muted-foreground">Listos para usar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDocuments}</div>
              <p className="text-xs text-muted-foreground">En procesamiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espacio Usado</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSize}</div>
              <p className="text-xs text-muted-foreground">De almacenamiento</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Cargar Documentos</TabsTrigger>
            <TabsTrigger value="documents">Gestionar Documentos</TabsTrigger>
            <TabsTrigger value="analytics">Análisis de Consultas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {documents.reduce((acc, doc) => {
                      const userId = doc.user_id;
                      return acc.includes(userId) ? acc : [...acc, userId];
                    }, [] as string[]).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Usuarios registrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultas Exitosas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.successful_chats || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.total_chats ? 
                      `${((analytics.successful_chats / analytics.total_chats) * 100).toFixed(1)}% tasa de éxito` 
                      : 'Sin datos'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.avg_response_time 
                      ? `${(analytics.avg_response_time / 1000).toFixed(2)}s`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Respuesta del sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.unique_users || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 días
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Preguntas Frecuentes</CardTitle>
                  <CardDescription>Top 5 consultas más comunes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chatLogs
                      .reduce((acc, log) => {
                        const existing = acc.find(item => 
                          item.message.toLowerCase().trim() === log.message.toLowerCase().trim()
                        );
                        if (existing) {
                          existing.count++;
                        } else {
                          acc.push({ message: log.message, count: 1 });
                        }
                        return acc;
                      }, [] as { message: string; count: number }[])
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {item.message.substring(0, 100)}
                              {item.message.length > 100 ? '...' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.count} {item.count === 1 ? 'consulta' : 'consultas'}
                            </p>
                          </div>
                        </div>
                      ))}
                    {chatLogs.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos de consultas aún
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Documentos</CardTitle>
                  <CardDescription>Distribución por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Procesados</span>
                          <span className="text-sm text-muted-foreground">
                            {documents.filter(d => d.status === 'processed').length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ 
                              width: `${documents.length > 0 
                                ? (documents.filter(d => d.status === 'processed').length / documents.length) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Pendientes</span>
                          <span className="text-sm text-muted-foreground">
                            {documents.filter(d => d.status === 'pending').length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500"
                            style={{ 
                              width: `${documents.length > 0 
                                ? (documents.filter(d => d.status === 'pending').length / documents.length) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Con Errores</span>
                          <span className="text-sm text-muted-foreground">
                            {documents.filter(d => d.status === 'error').length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500"
                            style={{ 
                              width: `${documents.length > 0 
                                ? (documents.filter(d => d.status === 'error').length / documents.length) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas 10 consultas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chatLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {log.profiles?.nombre_completo || 'Usuario anónimo'}
                          </p>
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <Badge variant="default" className="bg-green-500">Exitosa</Badge>
                            ) : (
                              <Badge variant="destructive">Error</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLogs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay actividad reciente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cargar Nuevo Documento</CardTitle>
                <CardDescription>
                  Formatos soportados: PDF, DOCX, XLSX, CSV, TXT, MD, HTML (máx. 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.html"
                    disabled={uploading}
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-5 w-5" />
                      <div className="flex-1">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Cargar Documento
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos del Sistema</CardTitle>
                <CardDescription>
                  {documents.length} documento{documents.length !== 1 ? "s" : ""} en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay documentos en el sistema
                  </p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)} • {doc.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Usuario: {doc.profiles?.nombre_completo || doc.profiles?.email || "Desconocido"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusIcon(doc.status)}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Análisis Detallado</h3>
                <p className="text-sm text-muted-foreground">Estadísticas de uso del chatbot</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={handleExportExcel} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>

            {/* Analytics Stats */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Consultas</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_chats}</div>
                    <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_chats > 0
                        ? ((analytics.successful_chats / analytics.total_chats) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.successful_chats} exitosas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.avg_response_time
                        ? (Number(analytics.avg_response_time) / 1000).toFixed(2)
                        : 0}
                      s
                    </div>
                    <p className="text-xs text-muted-foreground">De respuesta</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Chat Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Consultas Recientes</CardTitle>
                <CardDescription>
                  Últimas {chatLogs.length} consultas realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chatLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay consultas registradas
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {chatLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={log.status === "success" ? "default" : "destructive"}>
                                {log.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), "PPp", { locale: es })}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">
                              Usuario: {log.profiles?.nombre_completo || log.profiles?.email || "Anónimo"}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-semibold">Consulta:</span>{" "}
                                {log.message.length > 100
                                  ? log.message.substring(0, 100) + "..."
                                  : log.message}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Respuesta:</span>{" "}
                                {log.response.length > 150
                                  ? log.response.substring(0, 150) + "..."
                                  : log.response}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground text-right flex-shrink-0">
                            <span>{(log.response_time_ms / 1000).toFixed(2)}s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}