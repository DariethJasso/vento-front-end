-- Crear tabla de movimientos de efectivo (gastos e ingresos)
CREATE TABLE IF NOT EXISTS nuvly.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES nuvly.shifts(id),
    branch_id UUID REFERENCES nuvly.branches(id),
    business_id UUID REFERENCES nuvly.businesses(id),
    employee_id UUID REFERENCES nuvly.employees(id),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cash_movements_shift ON nuvly.cash_movements(shift_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_branch ON nuvly.cash_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_business ON nuvly.cash_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON nuvly.cash_movements(type);
CREATE INDEX IF NOT EXISTS idx_cash_movements_created_at ON nuvly.cash_movements(created_at);

-- Habilitar Row Level Security
ALTER TABLE nuvly.cash_movements ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean movimientos de su negocio
CREATE POLICY "Users can view cash movements from their business"
ON nuvly.cash_movements
FOR SELECT
USING (
    business_id IN (
        SELECT business_id FROM nuvly.employees WHERE user_id = auth.uid()
    )
);

-- Política para que los usuarios puedan crear movimientos
CREATE POLICY "Users can create cash movements for their business"
ON nuvly.cash_movements
FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT business_id FROM nuvly.employees WHERE user_id = auth.uid()
    )
);

-- Comentarios para documentación
COMMENT ON TABLE nuvly.cash_movements IS 'Tabla para registrar movimientos de efectivo (ingresos y gastos) durante los turnos';
COMMENT ON COLUMN nuvly.cash_movements.type IS 'Tipo de movimiento: income (ingreso) o expense (gasto)';
COMMENT ON COLUMN nuvly.cash_movements.amount IS 'Monto del movimiento en la moneda local';
COMMENT ON COLUMN nuvly.cash_movements.reason IS 'Motivo o concepto del movimiento';
