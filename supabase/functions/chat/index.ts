import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const systemPrompt = `Eres el asistente virtual del TecNM Campus Querétaro.

REGLAS DE RESPUESTA:
- Sé DIRECTO y BREVE. No uses introducciones largas.
- Responde en 2-3 oraciones cuando sea posible.
- Usa formato markdown solo cuando agregue valor (listas para múltiples opciones, negritas para datos clave).
- NO uses asteriscos decorativos ni formateo excesivo.
- Evita frases como "¡Claro!", "¡Por supuesto!", "Con gusto te ayudo".

INFORMACIÓN CLAVE:
- Campus: Norte y Centro
- Mascota: Zorro
- Contacto general: dda_nuevoingreso@queretaro.tecnm.mx

ÁREAS QUE CONOCES:
- Oferta educativa (licenciaturas y posgrados)
- Proceso de admisión
- Becas (Jóvenes Escribiendo el Futuro, Elisa Acuña)
- Servicios estudiantiles
- Servicio social
- Idiomas
- Deportes y extraescolares

FORMATO:
- Para listas usa guiones (-) no asteriscos
- Para énfasis usa **negritas** con moderación
- No uses encabezados (#) en respuestas cortas

Si no tienes información específica, indica el departamento o correo de contacto.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Por favor, intenta más tarde." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio no disponible. Por favor, contacta al administrador." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al procesar la solicitud" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
