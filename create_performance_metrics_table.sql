-- Create the missing performance_metrics table for dashboard functionality
-- This table stores monthly aggregated performance data for charts

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    feedback_sent INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0.0,
    click_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, month)
);

-- Enable RLS for multi-tenant access
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their company's performance metrics
CREATE POLICY "Users can access own company performance metrics"
    ON performance_metrics
    FOR ALL
    TO authenticated
    USING (company_id IN (
        SELECT users.company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_company_id ON performance_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_month ON performance_metrics(month);

-- Insert sample data for the simple test user's company
DO $$
DECLARE
    test_company_id UUID;
BEGIN
    -- Get the company ID for simple@test.com user
    SELECT company_id INTO test_company_id 
    FROM users 
    WHERE email = 'simple@test.com'
    LIMIT 1;
    
    IF test_company_id IS NOT NULL THEN
        -- Insert 6 months of sample performance data
        INSERT INTO performance_metrics (company_id, month, feedback_sent, open_rate, click_rate) VALUES
        (test_company_id, 'Jan', 145, 67.6, 23.4),
        (test_company_id, 'Feb', 167, 69.2, 24.6),
        (test_company_id, 'Mar', 189, 67.7, 23.8),
        (test_company_id, 'Apr', 201, 70.6, 25.9),
        (test_company_id, 'May', 234, 68.9, 24.8),
        (test_company_id, 'Jun', 267, 70.1, 25.1)
        ON CONFLICT (company_id, month) DO UPDATE SET
            feedback_sent = EXCLUDED.feedback_sent,
            open_rate = EXCLUDED.open_rate,
            click_rate = EXCLUDED.click_rate,
            updated_at = NOW();
        
        RAISE NOTICE 'Sample performance metrics inserted for company %', test_company_id;
    ELSE
        RAISE NOTICE 'Company not found for simple@test.com user';
    END IF;
END $$;
