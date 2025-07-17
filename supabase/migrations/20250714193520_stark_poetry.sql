/*
  # Add Feedback Tracking Functions

  1. Functions
    - increment_email_opens: Increment email opens count for candidate
    - increment_email_clicks: Increment email clicks count for candidate  
    - increment_course_enrollments: Increment course enrollments count for candidate

  2. Security
    - Functions use RLS and company_id validation
    - Only authenticated users can call functions
*/

-- Function to increment email opens
CREATE OR REPLACE FUNCTION increment_email_opens(candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this candidate
  IF NOT EXISTS (
    SELECT 1 FROM candidates c
    JOIN users u ON u.company_id = c.company_id
    WHERE c.id = candidate_id AND u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Increment email opens count
  UPDATE candidates 
  SET 
    email_opens = email_opens + 1,
    updated_at = now()
  WHERE id = candidate_id;
END;
$$;

-- Function to increment email clicks
CREATE OR REPLACE FUNCTION increment_email_clicks(candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this candidate
  IF NOT EXISTS (
    SELECT 1 FROM candidates c
    JOIN users u ON u.company_id = c.company_id
    WHERE c.id = candidate_id AND u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Increment email clicks count
  UPDATE candidates 
  SET 
    email_clicks = email_clicks + 1,
    updated_at = now()
  WHERE id = candidate_id;
END;
$$;

-- Function to increment course enrollments
CREATE OR REPLACE FUNCTION increment_course_enrollments(candidate_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this candidate
  IF NOT EXISTS (
    SELECT 1 FROM candidates c
    JOIN users u ON u.company_id = c.company_id
    WHERE c.id = candidate_id AND u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Increment course enrollments count
  UPDATE candidates 
  SET 
    course_enrollments = course_enrollments + 1,
    updated_at = now()
  WHERE id = candidate_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_email_opens(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_email_clicks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_course_enrollments(UUID) TO authenticated;