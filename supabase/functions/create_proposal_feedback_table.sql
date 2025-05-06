
CREATE TABLE IF NOT EXISTS public.proposal_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id),
  supervisor_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for proposal_feedback
ALTER TABLE public.proposal_feedback ENABLE ROW LEVEL SECURITY;

-- Supervisors can view feedback they've given
CREATE POLICY "Supervisors can view feedback they've given" ON public.proposal_feedback
  FOR SELECT USING (supervisor_id = auth.uid());

-- Supervisors can insert feedback 
CREATE POLICY "Supervisors can insert feedback" ON public.proposal_feedback
  FOR INSERT WITH CHECK (supervisor_id = auth.uid());

-- Create team_supervisors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  supervisor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add column for rejection reason if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'proposals' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.proposals ADD COLUMN rejection_reason TEXT;
  END IF;
END$$;
