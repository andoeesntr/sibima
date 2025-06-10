
-- Create storage bucket for guidance evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('guidance-evidence', 'guidance-evidence', true);

-- Create RLS policies for guidance evidence bucket
CREATE POLICY "Users can upload guidance evidence" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'guidance-evidence');

CREATE POLICY "Users can view guidance evidence" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'guidance-evidence');

CREATE POLICY "Users can update their guidance evidence" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'guidance-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their guidance evidence" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'guidance-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
