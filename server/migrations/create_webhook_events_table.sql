-- Tabela para controlar webhooks processados e evitar duplicação
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    payment_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON webhook_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Comentários para documentação
COMMENT ON TABLE webhook_events IS 'Tabela para controlar webhooks do MercadoPago já processados';
COMMENT ON COLUMN webhook_events.id IS 'ID único do webhook (vem do MercadoPago)';
COMMENT ON COLUMN webhook_events.payment_id IS 'ID do pagamento associado';
COMMENT ON COLUMN webhook_events.status IS 'Status do pagamento quando processado';
COMMENT ON COLUMN webhook_events.processed_at IS 'Timestamp de quando foi processado';
