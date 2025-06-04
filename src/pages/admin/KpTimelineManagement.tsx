
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Calendar, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  period: string;
  created_at: string;
  updated_at: string;
}

const KpTimelineManagement = () => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period: ''
  });

  useEffect(() => {
    fetchTimelineItems();
  }, []);

  const fetchTimelineItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kp_timeline')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTimelineItems(data || []);
    } catch (error) {
      console.error('Error fetching timeline items:', error);
      toast.error('Gagal memuat data timeline KP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.period.trim()) {
      toast.error('Judul dan periode harus diisi');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('kp_timeline')
          .update({
            title: formData.title,
            description: formData.description,
            period: formData.period,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Timeline berhasil diperbarui');
      } else {
        // Create new item
        const { error } = await supabase
          .from('kp_timeline')
          .insert({
            title: formData.title,
            description: formData.description,
            period: formData.period
          });

        if (error) throw error;
        toast.success('Timeline berhasil ditambahkan');
      }

      await fetchTimelineItems();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving timeline item:', error);
      toast.error('Gagal menyimpan timeline');
    }
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      period: item.period
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus timeline ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kp_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Timeline berhasil dihapus');
      await fetchTimelineItems();
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      toast.error('Gagal menghapus timeline');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      period: ''
    });
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      period: ''
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Timeline KP</h1>
          <p className="text-gray-600">Kelola timeline dan jadwal kegiatan Kerja Praktek</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Timeline
        </Button>
      </div>

      <div className="grid gap-4">
        {timelineItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Belum ada timeline yang dibuat</p>
              <Button onClick={handleAddNew} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Timeline Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          timelineItems.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-gray-500 mb-2">
                      Periode: {item.period}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {item.description && (
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Timeline' : 'Tambah Timeline Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui informasi timeline KP' : 'Buat timeline baru untuk kegiatan KP'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Timeline *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Pengajuan Proposal KP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Periode *</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="Contoh: Minggu ke-1 - ke-2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi detail tentang kegiatan pada periode ini..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                {editingItem ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KpTimelineManagement;
