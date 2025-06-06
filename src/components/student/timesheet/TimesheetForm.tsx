
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { timesheetService, TimesheetEntry } from '@/services/timesheetService';
import { useAuth } from '@/contexts/AuthContext';

const TimesheetForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState<TimesheetEntry | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    status: 'HADIR' as 'HADIR' | 'SAKIT' | 'IZIN' | 'LIBUR',
    notes: ''
  });

  useEffect(() => {
    checkExistingEntry();
  }, [formData.date, user]);

  const checkExistingEntry = async () => {
    if (!user) return;
    
    try {
      const entry = await timesheetService.getTimesheetByDate(user.id, formData.date);
      setExistingEntry(entry);
      
      if (entry) {
        setFormData({
          date: entry.date,
          start_time: entry.start_time || '',
          end_time: entry.end_time || '',
          status: entry.status,
          notes: entry.notes || ''
        });
      }
    } catch (error) {
      console.error('Error checking existing entry:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (formData.status === 'HADIR' && (!formData.start_time || !formData.end_time)) {
        toast.error('Jam mulai dan jam akhir harus diisi untuk status HADIR');
        return;
      }

      const timesheetData = {
        student_id: user.id,
        date: formData.date,
        start_time: formData.status === 'HADIR' ? formData.start_time : null,
        end_time: formData.status === 'HADIR' ? formData.end_time : null,
        status: formData.status,
        notes: formData.notes
      };

      if (existingEntry) {
        await timesheetService.updateTimesheet(existingEntry.id, timesheetData);
        toast.success('Timesheet berhasil diperbarui!');
      } else {
        await timesheetService.createTimesheet(timesheetData);
        toast.success('Timesheet berhasil disimpan!');
      }

      checkExistingEntry();
    } catch (error: any) {
      console.error('Error saving timesheet:', error);
      toast.error(error.message || 'Gagal menyimpan timesheet');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAKIT': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'IZIN': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LIBUR': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 p-6 rounded-lg text-white">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Timesheet Kerja Praktik</h1>
            <p className="text-green-100">Isi kehadiran harian Anda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-yellow-50 border-b border-yellow-200">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Clock className="h-5 w-5 text-yellow-500" />
            Input Kehadiran Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-green-800 font-medium">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border-green-300 focus:border-green-500"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-green-800 font-medium">Status Kehadiran</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HADIR">HADIR</SelectItem>
                  <SelectItem value="SAKIT">SAKIT</SelectItem>
                  <SelectItem value="IZIN">IZIN</SelectItem>
                  <SelectItem value="LIBUR">LIBUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time inputs - only show for HADIR */}
            {formData.status === 'HADIR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-green-800 font-medium">Jam Mulai</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                    required={formData.status === 'HADIR'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time" className="text-green-800 font-medium">Jam Akhir</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                    required={formData.status === 'HADIR'}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-green-800 font-medium">Keterangan (Opsional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tambahkan keterangan jika diperlukan..."
                className="border-green-300 focus:border-green-500"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              {existingEntry && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(existingEntry.status)}`}>
                  <CheckCircle className="h-4 w-4" />
                  Sudah mengisi untuk tanggal ini
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? 'Menyimpan...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {existingEntry ? 'Perbarui' : 'Simpan'} Timesheet
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetForm;
