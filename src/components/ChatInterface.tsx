import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BookOpen, GraduationCap, Users, CreditCard, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const quickActions = [
  { icon: BookOpen, label: "Conócenos", value: "Quiero conocer sobre el TecNM Campus Querétaro" },
  { icon: GraduationCap, label: "Oferta Educativa", value: "¿Qué carreras y posgrados ofrecen?" },
  { icon: CreditCard, label: "Becas", value: "¿Qué tipos de becas están disponibles?" },
  { icon: Users, label: "Servicios Estudiantiles", value: "¿Qué servicios tienen para estudiantes?" },
  { icon: Phone, label: "Contacto y Ubicación", value: "¿Dónde se encuentra el campus?" },
  { icon: BookOpen, label: "Reglamentos", value: "¿Cuáles son los reglamentos?"},
  { icon: Users, label: "Deportes", value: "¿Qué actividades deportivas tienen?"},
  { icon: Phone, label: "SOS", value: "Reporta un problema o solicita asistencia."},
];

const botResponses: { [key: string]: string } = {
  // Conócenos
  "Quiero conocer sobre el TecNM Campus Querétaro": "🦊 El TecNM Campus Querétaro es una institución de excelencia académica. Nuestra mascota es el Zorro, símbolo de astucia e inteligencia. Nuestro lema: 'Forjando el Futuro con Tecnología y Valores'. El zorro representa la agilidad mental y adaptabilidad que buscamos en nuestros estudiantes. ¿Qué más te gustaría saber?",
  
  // Oferta Educativa
  "¿Qué carreras y posgrados ofrecen?": "📚 LICENCIATURAS: Ingeniería Industrial, Sistemas Computacionales, Mecánica, Electrónica, Gestión Empresarial (todas con reconocimiento CACEI). POSGRADOS: Maestría en Ciencias en Ingeniería Industrial, Maestría en Administración. También ofrecemos cursos, capacitaciones y talleres especializados.",
  
  // Idiomas
  "Quiero información sobre idiomas": "🌍 CENTRO DE IDIOMAS: Ofrecemos clases de Inglés y Japonés en diversos niveles. Contamos con programas de certificación, exámenes de liberación y preparación para certificaciones internacionales. Informes: centroidiomas@queretaro.tecnm.mx",
  
  // Becas
  "¿Qué tipos de becas están disponibles?": "💰 BECAS DISPONIBLES: Excelencia académica, becas socioeconómicas, deportivas, culturales, programa 'Benito Juárez'. Nuestro sistema puede ayudarte a identificar las becas más adecuadas según tu perfil. ¿Eres estudiante actual o aspirante?",
  
  // Extraescolares y Deportes
  "¿Qué servicios tienen para estudiantes?": "🎨⚽ SERVICIOS: Extraescolares (artes plásticas, ritmos latinos, danza tradicional, gimnasio). Equipos deportivos (fútbol, basquetbol, voleibol). Equipos representativos (Zorracing). Servicios de enfermería, psicología, odontología. Programa de servicio social y vacantes laborales.",
  
  // Contacto y Ubicación
  "¿Dónde se encuentra el campus?": "📍 UBICACIONES: Campus Centro - Av. Tecnológico s/n, Col. Centro. Campus Norte - [ubicación]. Teléfono: (442) 227-4400. Email: queretaro@tecnm.mx. Horarios: Lunes a Viernes 8:00-18:00 hrs.",
  
  // Admisión
  "¿Cuáles son los requisitos de admisión?": "📋 ADMISIÓN: Certificado de bachillerato, acta de nacimiento, CURP, fotografías, aprobar examen CENEVAL EXANI-II. Periodos de registro: febrero-marzo (agosto) y agosto-septiembre (enero). Consulta convocatorias vigentes.",
  
  // Reglamentos
  "¿Dónde encuentro reglamentos y manuales?": "📖 DOCUMENTOS OFICIALES: Reglamento escolar, manual de estudiantes, políticas de privacidad y avisos legales disponibles en coordinación académica y en nuestra página oficial queretaro.tecnm.mx",
  
  // Servicio Social
  "Información sobre servicio social": "🤝 SERVICIO SOCIAL: Nuestro asistente te guía en todo el proceso: registro, seguimiento y entrega. Requisitos: 70% de créditos completados. Contacta a la coordinadora de servicio social para más detalles.",
  
  // Emergencias
  "Necesito ayuda urgente": "🆘 BOTÓN DE AYUDA: Para emergencias contacta: Enfermería (ext. 123), Psicología (ext. 124), Seguridad Campus (ext. 911). Para reportes o ayuda inmediata acude a cualquier área administrativa."
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy el asistente virtual de TecNM Campus Querétaro. Estoy aquí para ayudarte con información sobre nuestras carreras, procesos de admisión, becas y más. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const streamChat = async (conversationMessages: Array<{ role: string; content: string }>) => {
    // Elegir función según autenticación (RAG para usuarios logueados, pública si no)
    const { data: { session } } = await supabase.auth.getSession();

    const callStreaming = async (path: string, headers: Record<string, string>) => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ messages: conversationMessages }),
      });
      return resp;
    };

    try {
      // 1) Intentar RAG si hay sesión
      let resp: Response | null = null;
      if (session?.access_token) {
        resp = await callStreaming("chat-rag", { Authorization: `Bearer ${session.access_token}` });
        // Si el token no es válido o falta auth, volver a la función pública
        if (resp.status === 401 || resp.status === 403) {
          resp = null;
        }
      }

      // 2) Fallback: usar función pública sin auth
      if (!resp) {
        resp = await callStreaming("chat", {});
      }

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({ title: "Límite alcanzado", description: "Espera un momento e inténtalo de nuevo.", variant: "destructive" });
          return null;
        }
        if (resp.status === 402) {
          toast({ title: "Servicio no disponible", description: "Contacta al administrador.", variant: "destructive" });
          return null;
        }
        const errText = await resp.text();
        throw new Error(errText || "Error al conectar con el servicio de IA");
      }

      if (!resp.body) throw new Error("No se recibió respuesta del servidor");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              // Actualizar el último mensaje del asistente
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantContent } : m));
                }
                // Crear primer mensaje del asistente
                return [
                  ...prev,
                  { id: Date.now().toString(), text: assistantContent, isUser: false, timestamp: new Date() },
                ];
              });
            }
          } catch {
            // JSON incompleto, reponer en buffer
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      return assistantContent;
    } catch (error) {
      console.error("Error en streamChat:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error al procesar tu mensaje", variant: "destructive" });
      return null;
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Preparar historial de conversación
    const conversationHistory = messages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));
    conversationHistory.push({ role: "user", content: messageText });

    const result = await streamChat(conversationHistory);
    setIsTyping(false);

    if (!result) {
      // Si hubo error, mostrar mensaje de respaldo
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta nuevamente o contacta al (442) 227-4400.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
  };

  const handleQuickAction = (value: string) => {
    handleSendMessage(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {isTyping && (
          <div className="flex gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <div className="animate-pulse">...</div>
            </div>
            <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl px-4 py-3 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-muted/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.value)}
              className="flex items-center gap-2 text-xs h-auto py-2 px-3"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}