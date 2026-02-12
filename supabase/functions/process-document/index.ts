import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TextChunk {
  text: string;
  metadata: {
    chunk_index: number;
    start_char: number;
    end_char: number;
  };
}

// Sanitize text to remove null bytes and other problematic characters for PostgreSQL
function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove other control chars except \t, \n, \r
    .trim();
}

// Simple text splitter function
function splitText(text: string, chunkSize: number = 1000, overlap: number = 200): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  const cleanText = sanitizeText(text);

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    const chunkText = cleanText.slice(start, end);
    
    if (chunkText.trim().length === 0) {
      start += chunkSize - overlap;
      continue;
    }
    
    chunks.push({
      text: chunkText,
      metadata: {
        chunk_index: chunkIndex,
        start_char: start,
        end_char: end,
      },
    });

    start += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}

// Create deterministic embeddings using hash-based approach
function createEmbedding(text: string): number[] {
  const embedding: number[] = new Array(1536).fill(0);
  const normalizedText = text.toLowerCase().trim();
  
  for (let i = 0; i < normalizedText.length && i < 10000; i++) {
    const charCode = normalizedText.charCodeAt(i);
    const position = (i * 7 + charCode * 13) % 1536;
    embedding[position] += (charCode / 255) * 0.1;
  }
  
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
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] = embedding[i] / magnitude;
  }
  
  return embedding;
}

// Extract text from PDF using pure Deno-compatible parsing
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log("Starting PDF text extraction...");
  
  const bytes = new Uint8Array(arrayBuffer);
  const textContent: string[] = [];
  
  // Decode as Latin1 to handle binary data properly
  let pdfText = "";
  for (let i = 0; i < bytes.length; i++) {
    pdfText += String.fromCharCode(bytes[i]);
  }
  
  console.log("PDF size:", bytes.length, "bytes");
  
  // Method 1: Extract text from stream objects (most common in PDFs)
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(pdfText)) !== null) {
    const streamContent = streamMatch[1];
    
    // Look for BT...ET text blocks
    const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
    let btMatch;
    while ((btMatch = btRegex.exec(streamContent)) !== null) {
      const textBlock = btMatch[1];
      
      // Extract text from Tj operator (single string)
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
        const extracted = decodePdfString(tjMatch[1]);
        if (extracted.length > 0) {
          textContent.push(extracted);
        }
      }
      
      // Extract text from TJ operator (array of strings)
      const tjArrayRegex = /\[((?:[^[\]]*|\([^)]*\))*)\]\s*TJ/gi;
      let tjArrayMatch;
      while ((tjArrayMatch = tjArrayRegex.exec(textBlock)) !== null) {
        const arrayContent = tjArrayMatch[1];
        const stringRegex = /\(([^)]*)\)/g;
        let stringMatch;
        while ((stringMatch = stringRegex.exec(arrayContent)) !== null) {
          const extracted = decodePdfString(stringMatch[1]);
          if (extracted.length > 0) {
            textContent.push(extracted);
          }
        }
      }
    }
  }
  
  // Method 2: Direct extraction from parentheses (works for simple PDFs)
  if (textContent.length === 0) {
    console.log("Trying direct parentheses extraction...");
    const directRegex = /\(([^)]{2,})\)/g;
    let directMatch;
    while ((directMatch = directRegex.exec(pdfText)) !== null) {
      const content = decodePdfString(directMatch[1]);
      // Only include printable content
      if (content.length > 2 && isPrintableText(content)) {
        textContent.push(content);
      }
    }
  }
  
  // Method 3: Extract from hex strings
  if (textContent.length === 0) {
    console.log("Trying hex string extraction...");
    const hexRegex = /<([0-9A-Fa-f]+)>/g;
    let hexMatch;
    while ((hexMatch = hexRegex.exec(pdfText)) !== null) {
      const hex = hexMatch[1];
      if (hex.length >= 4 && hex.length % 2 === 0) {
        let decoded = "";
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16);
          if (charCode >= 32 && charCode <= 126) {
            decoded += String.fromCharCode(charCode);
          }
        }
        if (decoded.length > 2 && isPrintableText(decoded)) {
          textContent.push(decoded);
        }
      }
    }
  }
  
  console.log("Extracted", textContent.length, "text segments");
  
  if (textContent.length === 0) {
    throw new Error("No se pudo extraer texto del PDF. El archivo puede estar escaneado, protegido o no contener texto seleccionable.");
  }
  
  // Join and clean up the text
  let result = textContent.join(" ")
    .replace(/\s+/g, " ")
    .trim();
  
  console.log("Final text length:", result.length);
  
  return result;
}

// Helper function to decode PDF string escapes
function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .replace(/\\([()])/g, "$1")
    .replace(/\\(\d{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

// Helper function to check if text is printable
function isPrintableText(text: string): boolean {
  // At least 70% of characters should be printable ASCII or common Unicode
  let printable = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255) || 
        code === 10 || code === 13 || code === 9) {
      printable++;
    }
  }
  return (printable / text.length) > 0.7;
}

// Extract text from DOCX
async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // DOCX is a ZIP file containing XML
    const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) {
      throw new Error("No se encontró el documento dentro del archivo DOCX");
    }
    
    // Extract text from XML tags
    const textContent = documentXml
      .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1 ')
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Error al procesar el archivo DOCX: " + (error instanceof Error ? error.message : "Error desconocido"));
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Process document function called");

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log("Verifying user authentication...");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error("Auth error:", userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error("No user found");
      throw new Error("Unauthorized");
    }

    console.log("User authenticated:", user.id);

    const { document_id } = await req.json();
    
    if (!document_id) {
      console.error("Missing document_id in request");
      throw new Error("document_id is required");
    }

    console.log("Processing document:", document_id);

    // Get document from database
    const { data: document, error: docError } = await supabaseClient
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError) {
      console.error("Error fetching document:", docError);
      throw new Error(`Document not found: ${docError.message}`);
    }
    
    if (!document) {
      console.error("Document not found in database");
      throw new Error("Document not found");
    }

    console.log("Document found:", document.title, "Type:", document.file_type);

    // Download file from storage using service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from("documents")
      .download(document.storage_path);

    if (downloadError) {
      console.error("Error downloading file:", downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    if (!fileData) {
      console.error("No file data received");
      throw new Error("Failed to download file: No data received");
    }
    
    console.log("File downloaded successfully, size:", fileData.size, "bytes");

    // Extract text based on file type
    let text = "";
    const fileType = document.file_type;
    const fileName = document.file_name.toLowerCase();
    
    if (fileType === "text/plain" || fileType === "text/markdown" || 
        fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      console.log("Processing as plain text...");
      text = await fileData.text();
    } else if (fileType === "text/csv" || fileName.endsWith('.csv')) {
      console.log("Processing as CSV...");
      const csvText = await fileData.text();
      const lines = csvText.split("\n");
      text = "Contenido del archivo CSV:\n\n";
      lines.forEach((line, index) => {
        if (line.trim()) {
          const cells = line.split(",");
          if (index === 0) {
            text += "Encabezados: " + cells.join(" | ") + "\n\n";
          } else {
            text += "Fila " + index + ": " + cells.join(" | ") + "\n";
          }
        }
      });
    } else if (fileType === "text/html" || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
      console.log("Processing as HTML...");
      const htmlText = await fileData.text();
      // Strip HTML tags
      text = htmlText
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (fileType === "application/pdf" || fileName.endsWith('.pdf')) {
      console.log("Processing as PDF...");
      const arrayBuffer = await fileData.arrayBuffer();
      text = await extractTextFromPDF(arrayBuffer);
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
               fileName.endsWith('.docx')) {
      console.log("Processing as DOCX...");
      const arrayBuffer = await fileData.arrayBuffer();
      text = await extractTextFromDOCX(arrayBuffer);
    } else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
               fileName.endsWith('.xlsx')) {
      console.log("Processing as XLSX...");
      // Basic XLSX processing - extract shared strings
      try {
        const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
        const arrayBuffer = await fileData.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        const sharedStrings = await zip.file("xl/sharedStrings.xml")?.async("string");
        if (sharedStrings) {
          text = sharedStrings
            .replace(/<si>.*?<t[^>]*>([^<]*)<\/t>.*?<\/si>/gs, '$1\n')
            .replace(/<[^>]+>/g, '')
            .trim();
        }
        
        if (!text) {
          throw new Error("No se pudo extraer texto del archivo Excel");
        }
        
        text = "Contenido del archivo Excel:\n\n" + text;
      } catch (error) {
        console.error("XLSX extraction error:", error);
        throw new Error("Error al procesar el archivo Excel: " + (error instanceof Error ? error.message : "Error desconocido"));
      }
    } else {
      // Try as plain text as fallback
      console.log("Processing as unknown type, trying plain text...");
      text = await fileData.text();
      
      // Check if it looks like binary data
      const binaryCheck = text.slice(0, 100);
      if (/[\x00-\x08\x0E-\x1F]/.test(binaryCheck)) {
        throw new Error(`Tipo de archivo no soportado: ${fileType}. Solo se admiten PDF, DOCX, XLSX, CSV, TXT, MD y HTML.`);
      }
    }

    console.log("Extracted text length:", text.length);

    if (text.length === 0) {
      console.warn("No text content extracted from file");
      throw new Error("No se pudo extraer contenido de texto del archivo. Verifica que el archivo contenga texto legible.");
    }

    // Log a preview of the extracted text
    console.log("Text preview:", text.substring(0, 200));

    // Split text into chunks
    const chunks = splitText(text);
    console.log("Created chunks:", chunks.length);

    if (chunks.length === 0) {
      throw new Error("No se generaron chunks de texto. El documento puede estar vacío o contener solo caracteres no válidos.");
    }

    // Delete any existing chunks for this document (in case of reprocessing)
    await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("document_id", document_id);

    let successfulChunks = 0;
    let failedChunks = 0;

    for (const chunk of chunks) {
      try {
        console.log(`Processing chunk ${chunk.metadata.chunk_index + 1}/${chunks.length}`);
        const embedding = createEmbedding(chunk.text);
        
        const { error: insertError } = await supabaseAdmin
          .from("document_chunks")
          .insert({
            document_id: document_id,
            chunk_index: chunk.metadata.chunk_index,
            content: chunk.text,
            metadata: chunk.metadata,
            embedding: embedding,
          });

        if (insertError) {
          console.error("Error inserting chunk:", insertError);
          failedChunks++;
        } else {
          successfulChunks++;
        }
      } catch (error) {
        console.error("Error processing chunk:", error);
        failedChunks++;
      }
    }

    console.log(`Chunks processed: ${successfulChunks} successful, ${failedChunks} failed`);

    // Update document status
    const finalStatus = failedChunks === 0 ? "processed" : (successfulChunks > 0 ? "partial" : "error");
    console.log("Updating document status to:", finalStatus);
    
    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        status: finalStatus,
        processed_at: new Date().toISOString(),
        metadata: {
          chunks_created: successfulChunks,
          chunks_failed: failedChunks,
          text_length: text.length,
        }
      })
      .eq("id", document_id);

    if (updateError) {
      console.error("Error updating document status:", updateError);
    }

    console.log("Document processing completed");

    return new Response(
      JSON.stringify({ 
        success: true,
        chunks_created: successfulChunks,
        chunks_failed: failedChunks,
        total_chunks: chunks.length,
        status: finalStatus
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Process document error:", error);
    
    // Try to update document status to error with error message
    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const { document_id } = await req.clone().json();
      if (document_id) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el documento";
        await supabaseAdmin
          .from("documents")
          .update({ 
            status: "error",
            metadata: { 
              error_message: errorMessage,
              error_at: new Date().toISOString()
            }
          })
          .eq("id", document_id);
      }
    } catch (updateError) {
      console.error("Failed to update document status to error:", updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
