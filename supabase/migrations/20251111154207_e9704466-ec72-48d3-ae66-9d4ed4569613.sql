-- Create chat_logs table for analytics
CREATE TABLE public.chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_chat_logs_user_id ON public.chat_logs(user_id);
CREATE INDEX idx_chat_logs_created_at ON public.chat_logs(created_at DESC);
CREATE INDEX idx_chat_logs_status ON public.chat_logs(status);

-- Enable RLS
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chat logs"
  ON public.chat_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat logs"
  ON public.chat_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create function to get chat analytics
CREATE OR REPLACE FUNCTION public.get_chat_analytics(
  start_date TIMESTAMPTZ DEFAULT now() - interval '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  total_chats BIGINT,
  successful_chats BIGINT,
  failed_chats BIGINT,
  avg_response_time NUMERIC,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_chats,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_chats,
    COUNT(*) FILTER (WHERE status = 'error')::BIGINT as failed_chats,
    ROUND(AVG(response_time_ms), 2) as avg_response_time,
    COUNT(DISTINCT user_id)::BIGINT as unique_users
  FROM public.chat_logs
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$;