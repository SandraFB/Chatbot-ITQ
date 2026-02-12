import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileText, Loader2, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  metadata?: {
    error_message?: string;
    error_at?: string;
  } | null;
}

export default function Documentos() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      loadDocuments();
    }
  }, [user, authLoading, navigate]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as Document[]);
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
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
        "text/html",
      ];

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no soportado",
          description: "Por favor, selecciona un archivo PDF, DOCX, TXT, MD o HTML",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El tamaño máximo es 10MB",
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
      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: insertError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: selectedFile.name.replace(/\.[^/.]+$/, ""),
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          storage_path: filePath,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Documento cargado",
        description: "Procesando documento...",
      });

      // Process document
      const { error: processError } = await supabase.functions.invoke("process-document", {
        body: { document_id: document.id },
      });

      if (processError) {
        console.error("Process error:", processError);
        toast({
          title: "Error al procesar",
          description: "El documento se cargó pero hubo un error al procesarlo",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Procesamiento iniciado",
          description: "El documento está siendo procesado. Esto puede tomar unos minutos.",
        });
      }

      setSelectedFile(null);
      loadDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    try {
      // Delete from storage
      await supabase.storage.from("documents").remove([doc.storage_path]);

      // Delete from database (cascades to chunks)
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });

      loadDocuments();
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
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Documentos</h1>
          <p className="text-muted-foreground">
            Carga documentos para mejorar las respuestas del chatbot con información específica
          </p>
        </div>

        {/* Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cargar Nuevo Documento</CardTitle>
            <CardDescription>
              Formatos soportados: PDF, DOCX, TXT, MD, HTML (máx. 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <label 
                className={`
                  relative flex flex-col items-center justify-center 
                  w-full h-32 border-2 border-dashed rounded-lg 
                  cursor-pointer transition-all duration-200
                  ${uploading 
                    ? 'border-muted bg-muted/30 cursor-not-allowed' 
                    : 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 active:scale-[0.99]'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-2 transition-colors ${uploading ? 'text-muted-foreground' : 'text-primary/60'}`} />
                  <p className="mb-1 text-sm font-medium text-foreground">
                    {uploading ? 'Cargando...' : 'Haz clic para seleccionar archivo'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, TXT, MD, HTML (máx. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.txt,.md,.html"
                  disabled={uploading}
                />
              </label>
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

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Cargados</CardTitle>
            <CardDescription>
              {documents.length} documento{documents.length !== 1 ? "s" : ""} en total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay documentos cargados aún
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex flex-col gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      doc.status === 'error' ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {doc.status === 'error' ? (
                        <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                      ) : doc.status === 'processing' ? (
                        <Clock className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.file_size)} • {doc.file_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                    {doc.status === 'error' && doc.metadata && typeof doc.metadata === 'object' && 'error_message' in doc.metadata && (
                      <div className="ml-11 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                        <span className="font-medium">Error: </span>
                        {(doc.metadata as { error_message?: string }).error_message || 'Error desconocido al procesar el documento'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
