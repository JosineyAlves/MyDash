-- 🚀 INTEGRAÇÃO OFICIAL SUPABASE + MAILERSEND
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- FUNÇÃO OFICIAL PARA ENVIO DE EMAILS
-- ========================================
CREATE OR REPLACE FUNCTION public.send_email_message(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_token TEXT;
  api_url TEXT := 'https://api.mailersend.com/v1/email';
  http_response JSONB;
  email_data JSONB;
  template_id TEXT;
  variables JSONB;
  recipient_email TEXT;
  sender_email TEXT;
  subject_text TEXT;
  html_body TEXT;
  text_body TEXT;
  message_id UUID;
BEGIN
  -- Extrair dados do payload
  sender_email := payload->>'sender';
  recipient_email := payload->>'recipient';
  subject_text := payload->>'subject';
  template_id := payload->>'template_id';
  variables := payload->'variables';
  html_body := payload->>'html_body';
  text_body := payload->>'text_body';
  
  -- Validar campos obrigatórios
  IF recipient_email IS NULL OR sender_email IS NULL THEN
    RAISE EXCEPTION 'Campos obrigatórios: sender, recipient';
  END IF;
  
  -- Buscar token da API do MailerSend
  SELECT value INTO api_token 
  FROM private.keys 
  WHERE key = 'MAILERSEND_API_TOKEN';
  
  IF api_token IS NULL THEN
    RAISE EXCEPTION 'Token da API do MailerSend não encontrado';
  END IF;
  
  -- Preparar dados para o MailerSend
  IF template_id IS NOT NULL THEN
    -- Usar template do MailerSend
    email_data := jsonb_build_object(
      'from', jsonb_build_object('email', sender_email),
      'to', jsonb_build_array(
        jsonb_build_object('email', recipient_email)
      ),
      'template_id', template_id,
      'variables', jsonb_build_array(
        jsonb_build_object(
          'email', recipient_email,
          'substitutions', variables
        )
      )
    );
  ELSE
    -- Envio direto (fallback)
    email_data := jsonb_build_object(
      'from', jsonb_build_object('email', sender_email),
      'to', jsonb_build_array(
        jsonb_build_object('email', recipient_email)
      ),
      'subject', subject_text,
      'html', COALESCE(html_body, ''),
      'text', COALESCE(text_body, '')
    );
  END IF;
  
  -- Fazer requisição HTTP para o MailerSend
  SELECT content::jsonb INTO http_response
  FROM http((
    'POST',
    api_url,
    ARRAY[
      http_header('Authorization', 'Bearer ' || api_token),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    email_data::text
  ));
  
  -- Verificar se a requisição foi bem-sucedida
  IF http_response->>'status' = '200' OR http_response->>'status' = '202' THEN
    -- Sucesso - registrar na tabela messages se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
      INSERT INTO messages (
        sender,
        recipient,
        subject,
        html_body,
        text_body,
        status,
        sent_at,
        provider_response
      ) VALUES (
        sender_email,
        recipient_email,
        subject_text,
        html_body,
        text_body,
        'sent',
        NOW(),
        jsonb_build_object(
          'method', 'mailersend_template',
          'template_id', template_id,
          'variables', variables,
          'mailersend_response', http_response,
          'status', 'sent'
        )
      ) RETURNING id INTO message_id;
    END IF;
    
    -- Retornar sucesso
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Email enviado com sucesso',
      'mailersend_response', http_response,
      'template_id', template_id,
      'recipient', recipient_email,
      'message_id', message_id
    );
  ELSE
    -- Erro - registrar na tabela messages se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
      INSERT INTO messages (
        sender,
        recipient,
        subject,
        html_body,
        text_body,
        status,
        sent_at,
        provider_response
      ) VALUES (
        sender_email,
        recipient_email,
        subject_text,
        html_body,
        text_body,
        'failed',
        NOW(),
        jsonb_build_object(
          'method', 'mailersend_template',
          'template_id', template_id,
          'variables', variables,
          'error', http_response->>'content',
          'status', 'failed'
        )
      );
    END IF;
    
    -- Retornar erro
    RAISE EXCEPTION 'Erro ao enviar email: % - %', 
      http_response->>'status', 
      http_response->>'content';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e retornar erro
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE,
      'payload', payload
    );
END;
$$;

-- ========================================
-- VERIFICAÇÃO DA FUNÇÃO
-- ========================================
-- Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'send_email_message'
  AND routine_schema = 'public';

-- ========================================
-- PERMISSÕES
-- ========================================
-- Garantir que a função pode ser executada
GRANT EXECUTE ON FUNCTION public.send_email_message(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_email_message(JSONB) TO service_role;

-- ========================================
-- TESTE DA FUNÇÃO
-- ========================================
-- Testar a função com template do MailerSend
SELECT public.send_email_message('{
  "sender": "suporte@vmetrics.com.br",
  "recipient": "teste@exemplo.com",
  "subject": "Teste de Email via Integração Oficial",
  "template_id": "zr6ke4njwrmgon12",
  "variables": {
    "user_name": "Usuário Teste",
    "signup_url": "https://exemplo.com/signup",
    "company_name": "VMetrics"
  }
}'::jsonb);
