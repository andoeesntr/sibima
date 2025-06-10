
-- Add evidence_url column to kp_guidance_schedule table
ALTER TABLE public.kp_guidance_schedule 
ADD COLUMN evidence_url TEXT;
