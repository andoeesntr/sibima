
-- Create enhanced activity logs table for real system activities
CREATE TABLE IF NOT EXISTS public.system_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'proposal_action', 'evaluation', 'download', 'upload', 'timesheet', 'system'
  action_description TEXT NOT NULL,
  target_type TEXT, -- 'proposal', 'evaluation', 'timesheet', 'document'
  target_id UUID,
  metadata JSONB, -- Additional data like proposal title, student name, etc.
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing activity logs (coordinators and supervisors can see all)
CREATE POLICY "Coordinators and supervisors can view all activity logs" 
  ON public.system_activity_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('coordinator', 'supervisor')
    )
  );

-- Create policy for inserting activity logs (authenticated users can log their activities)
CREATE POLICY "Authenticated users can create activity logs" 
  ON public.system_activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create triggers to automatically log activities

-- Function to log proposal status changes
CREATE OR REPLACE FUNCTION log_proposal_activity()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  actor_role TEXT;
  proposal_title TEXT;
  student_name TEXT;
BEGIN
  -- Get actor information
  SELECT p.full_name, p.role INTO actor_name, actor_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  -- Get proposal and student information
  SELECT pr.title INTO proposal_title FROM public.proposals pr WHERE pr.id = NEW.id;
  SELECT p.full_name INTO student_name 
  FROM public.profiles p 
  WHERE p.id = NEW.student_id;

  -- Log the activity based on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.system_activity_logs (
      user_id,
      user_name,
      user_role,
      action_type,
      action_description,
      target_type,
      target_id,
      metadata
    ) VALUES (
      auth.uid(),
      COALESCE(actor_name, 'System'),
      COALESCE(actor_role, 'system'),
      'proposal_action',
      CASE 
        WHEN NEW.status = 'approved' THEN 'Menyetujui proposal "' || proposal_title || '"'
        WHEN NEW.status = 'rejected' THEN 'Menolak proposal "' || proposal_title || '"'
        WHEN NEW.status = 'revision' THEN 'Meminta revisi proposal "' || proposal_title || '"'
        ELSE 'Mengubah status proposal "' || proposal_title || '"'
      END,
      'proposal',
      NEW.id,
      jsonb_build_object(
        'proposal_title', proposal_title,
        'student_name', student_name,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for proposal status changes
DROP TRIGGER IF EXISTS trigger_log_proposal_activity ON public.proposals;
CREATE TRIGGER trigger_log_proposal_activity
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION log_proposal_activity();

-- Function to log new proposal submissions
CREATE OR REPLACE FUNCTION log_proposal_submission()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
BEGIN
  -- Get student information
  SELECT p.full_name INTO student_name 
  FROM public.profiles p 
  WHERE p.id = NEW.student_id;

  -- Log new proposal submission
  INSERT INTO public.system_activity_logs (
    user_id,
    user_name,
    user_role,
    action_type,
    action_description,
    target_type,
    target_id,
    metadata
  ) VALUES (
    NEW.student_id,
    COALESCE(student_name, 'Unknown Student'),
    'student',
    'proposal_action',
    'Mengajukan proposal "' || NEW.title || '"',
    'proposal',
    NEW.id,
    jsonb_build_object(
      'proposal_title', NEW.title,
      'student_name', student_name,
      'company_name', NEW.company_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new proposal submissions
DROP TRIGGER IF EXISTS trigger_log_proposal_submission ON public.proposals;
CREATE TRIGGER trigger_log_proposal_submission
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION log_proposal_submission();

-- Function to log evaluation activities
CREATE OR REPLACE FUNCTION log_evaluation_activity()
RETURNS TRIGGER AS $$
DECLARE
  evaluator_name TEXT;
  evaluator_role TEXT;
  student_name TEXT;
BEGIN
  -- Get evaluator information
  SELECT p.full_name, p.role INTO evaluator_name, evaluator_role
  FROM public.profiles p
  WHERE p.id = NEW.evaluator_id;

  -- Get student information
  SELECT p.full_name INTO student_name 
  FROM public.profiles p 
  WHERE p.id = NEW.student_id;

  -- Log evaluation activity
  INSERT INTO public.system_activity_logs (
    user_id,
    user_name,
    user_role,
    action_type,
    action_description,
    target_type,
    target_id,
    metadata
  ) VALUES (
    NEW.evaluator_id,
    COALESCE(evaluator_name, 'Unknown Evaluator'),
    COALESCE(evaluator_role, 'supervisor'),
    'evaluation',
    'Menginput nilai KP untuk ' || COALESCE(student_name, 'mahasiswa'),
    'evaluation',
    NEW.id,
    jsonb_build_object(
      'student_name', student_name,
      'evaluator_name', evaluator_name,
      'score', NEW.score,
      'evaluator_type', NEW.evaluator_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for evaluations
DROP TRIGGER IF EXISTS trigger_log_evaluation_activity ON public.evaluations;
CREATE TRIGGER trigger_log_evaluation_activity
  AFTER INSERT ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION log_evaluation_activity();

-- Function to log timesheet activities
CREATE OR REPLACE FUNCTION log_timesheet_activity()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
BEGIN
  -- Get student information
  SELECT p.full_name INTO student_name 
  FROM public.profiles p 
  WHERE p.id = NEW.student_id;

  -- Log timesheet activity
  INSERT INTO public.system_activity_logs (
    user_id,
    user_name,
    user_role,
    action_type,
    action_description,
    target_type,
    target_id,
    metadata
  ) VALUES (
    NEW.student_id,
    COALESCE(student_name, 'Unknown Student'),
    'student',
    'timesheet',
    'Mengisi timesheet harian',
    'timesheet',
    NEW.id,
    jsonb_build_object(
      'student_name', student_name,
      'date', NEW.date,
      'status', NEW.status,
      'duration_minutes', NEW.duration_minutes
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for timesheet entries
DROP TRIGGER IF EXISTS trigger_log_timesheet_activity ON public.kp_timesheet;
CREATE TRIGGER trigger_log_timesheet_activity
  AFTER INSERT ON public.kp_timesheet
  FOR EACH ROW
  EXECUTE FUNCTION log_timesheet_activity();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_timestamp ON public.system_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_user_id ON public.system_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_action_type ON public.system_activity_logs(action_type);
