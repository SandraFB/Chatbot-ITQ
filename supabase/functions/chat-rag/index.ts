import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create deterministic embeddings using hash-based approach
// Same algorithm as process-document for consistency
function createEmbedding(text: string): number[] {
  const embedding: number[] = new Array(1536).fill(0);
  
  // Normalize text
  const normalizedText = text.toLowerCase().trim();
  
  // Create a deterministic hash-based embedding
  for (let i = 0; i < normalizedText.length && i < 10000; i++) {
    const charCode = normalizedText.charCodeAt(i);
    const position = (i * 7 + charCode * 13) % 1536;
    embedding[position] += (charCode / 255) * 0.1;
  }
  
  // Add word-based features
  const words = normalizedText.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let wordHash = 0;
    for (let j = 0; j < word.length; j++) {
      wordHash = ((wordHash << 5) - wordHash + word.charCodeAt(j)) | 0;
    }
    const position = Math.abs(wordHash) % 1536;
    embedding[position] += 0.05;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] = embedding[i] / magnitude;
  }
  
  return embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    
    console.log("Processing RAG chat request for user:", user.id);

    const startTime = Date.now();

    // Try to create embedding and search for relevant chunks, but continue without RAG if it fails
    let context = "";
    let relevantChunks: any[] = [];
    
    try {
      const queryEmbedding = createEmbedding(lastUserMessage);
      console.log("Query embedding created, searching for chunks...");

      // Use a very low threshold since hash-based embeddings are not semantic
      // The hash approach creates sparse vectors, so similarity scores will be low
      const { data: chunks, error: searchError } = await supabaseClient
        .rpc("match_document_chunks", {
          query_embedding: queryEmbedding,
          match_threshold: 0.01, // Very low threshold for hash-based embeddings
          match_count: 5,
          filter_user_id: user.id,
        });

      if (searchError) {
        console.error("Search error:", searchError);
      } else {
        console.log("Chunks returned from DB:", chunks?.length || 0);
        if (chunks && chunks.length > 0) {
          relevantChunks = chunks;
          console.log("Found relevant chunks:", relevantChunks.length);
          console.log("Chunk similarities:", chunks.map((c: any) => c.similarity));
          context = "\n\nCONTEXTO RELEVANTE DE DOCUMENTOS:\n\n";
          context += relevantChunks
            .map((chunk: any) => `- ${chunk.content}`)
            .join("\n\n");
        } else {
          console.log("No chunks found above threshold");
        }
      }
    } catch (embeddingError) {
      console.error("Embedding/search error (continuing without RAG):", embeddingError);
      // Continue without RAG context
    }

    const hasContext = relevantChunks.length > 0;
    
    const systemPrompt = `Eres el asistente virtual del TecNM Campus Querétaro.

REGLAS DE RESPUESTA:
- Sé DIRECTO y BREVE. Responde en 2-3 oraciones cuando sea posible.
- Usa markdown solo cuando agregue valor (listas para opciones, negritas para datos clave).
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

${hasContext ? `
CONTEXTO IMPORTANTE DE DOCUMENTOS (usa esta información como fuente PRIORITARIA):
${context}

INSTRUCCIONES RAG:
- Responde basándote PRINCIPALMENTE en el contexto proporcionado arriba.
- Si el contexto contiene la respuesta, úsalo directamente.
- Si el contexto no es relevante para la pregunta, usa tu conocimiento general.
` : ""}

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

    // Log the chat interaction (do not await to avoid blocking)
    const responseTime = Date.now() - startTime;
    supabaseClient.from("chat_logs").insert({
      user_id: user.id,
      message: lastUserMessage,
      response: "Streaming response",
      response_time_ms: responseTime,
      status: response.ok ? "success" : "error",
    }).then(({ error: logError }) => {
      if (logError) {
        console.error("Failed to log chat:", logError);
      }
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat RAG error:", e);
    
    // Log error (do not await)
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      
      supabaseClient.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabaseClient.from("chat_logs").insert({
            user_id: user.id,
            message: "Error occurred",
            response: e instanceof Error ? e.message : "Unknown error",
            response_time_ms: 0,
            status: "error",
          });
        }
      });
    }
    
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
