
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, MapPin, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GuidanceRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  guidanceType: 'regular' | 'scheduled';
}

const GuidanceRequestForm = ({ onSuccess, onCancel, guidanceType }: GuidanceRequestFormProps) => {
  const [requestData, setRequestData] = useState({
    requested_date: '',
    location: '',
    topic: '',
    guidance_type: guidanceType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User tidak ditemukan');
      return;
    }

    if (!requestData.requested_date || !requestData.topic) {
      toast.error('Harap isi tanggal dan topik bimbingan');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get supervisor ID from user's proposal
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select('supervisor_id')
        .eq('student_id', user.id)
        .eq('status', 'approved')
        .single();

      if (proposalError || !proposalData?.supervisor_id) {
        toast.error('Supervisor tidak ditemukan. Pastikan proposal Anda sudah disetujui.');
        return;
      }

      const { error } = await supabase
        .from('kp_guidance_schedule')
        .insert({
          student_id: user.id,
          supervisor_id: proposalData.supervisor_id,
          requested_date: requestData.requested_date,
          location: requestData.location || null,
          topic: requestData.topic,
          status: 'requested',
          guidance_type: requestData.guidance_type
        });

      if (error) throw error;

      toast.success(`Permintaan bimbingan ${guidanceType === 'scheduled' ? 'terjadwal' : 'reguler'} berhasil dikirim`);
      onSuccess();
    } catch (error) {
      console.error('Error submitting guidance request:', error);
      toast.error('Gagal mengirim permintaan bimbingan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Ajukan {guidanceType === 'scheduled' ? 'Bimbingan Terjadwal' : 'Sesi Bimbingan'}
        </CardTitle>
        <CardDescription>
          {guidanceType === 'scheduled' 
            ? 'Ajukan permintaan untuk bimbingan terjadwal yang diwajibkan (2x)' 
            : 'Ajukan permintaan sesi bimbingan reguler dengan dosen pembimbing'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="requested_date">Tanggal & Waktu yang Diinginkan *</Label>
            <Input
              id="requested_date"
              type="datetime-local"
              value={requestData.requested_date}
              onChange={(e) => handleInputChange('requested_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi Bimbingan</Label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="location"
                type="text"
                placeholder="Contoh: Ruang Dosen, Online (Teams), dll"
                value={requestData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topik Bimbingan *</Label>
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-3" />
              <Textarea
                id="topic"
                placeholder="Jelaskan topik atau hal yang ingin didiskusikan dalam bimbingan ini..."
                value={requestData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                required
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Permintaan
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuidanceRequestForm;
