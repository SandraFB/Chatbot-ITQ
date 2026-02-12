-- Permitir que la edge function (usando service role key) inserte chunks
CREATE POLICY "Service role can insert document chunks"
ON public.document_chunks
FOR INSERT
TO service_role
WITH CHECK (true);

-- Permitir que la edge function actualice documentos
CREATE POLICY "Service role can update documents"
ON public.documents
FOR UPDATE
TO service_role
USING (true);

-- Políticas de storage para permitir que edge functions descarguen documentos
CREATE POLICY "Service role can read documents"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'documents');