
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, User, Clock, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Discussion {
  id: string;
  title: string;
  content: string;
  stage: string;
  created_at: string;
  author: {
    full_name: string;
    role: string;
  };
  replies?: Discussion[];
}

const KpDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    stage: 'proposal'
  });

  const [replyContent, setReplyContent] = useState('');

  const stages = [
    { value: 'proposal', label: 'Proposal' },
    { value: 'guidance', label: 'Bimbingan' },
    { value: 'report', label: 'Laporan' },
    { value: 'presentation', label: 'Presentasi' }
  ];

  const fetchDiscussions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('kp_discussions')
        .select(`
          *,
          author:author_id (
            full_name,
            role
          )
        `)
        .eq('student_id', user.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies } = await supabase
            .from('kp_discussions')
            .select(`
              *,
              author:author_id (
                full_name,
                role
              )
            `)
            .eq('parent_id', discussion.id)
            .order('created_at', { ascending: true });

          return {
            ...discussion,
            replies: replies || []
          };
        })
      );

      setDiscussions(discussionsWithReplies);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Gagal mengambil data diskusi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('kp_discussions')
        .insert({
          student_id: user.id,
          author_id: user.id,
          title: newDiscussion.title,
          content: newDiscussion.content,
          stage: newDiscussion.stage
        })
        .select(`
          *,
          author:author_id (
            full_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      setDiscussions(prev => [{ ...data, replies: [] }, ...prev]);
      setNewDiscussion({ title: '', content: '', stage: 'proposal' });
      setIsCreating(false);
      toast.success('Diskusi berhasil dibuat');
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Gagal membuat diskusi');
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!user?.id || !replyContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('kp_discussions')
        .insert({
          student_id: user.id,
          author_id: user.id,
          title: `Re: ${discussions.find(d => d.id === discussionId)?.title}`,
          content: replyContent,
          stage: discussions.find(d => d.id === discussionId)?.stage || 'proposal',
          parent_id: discussionId
        })
        .select(`
          *,
          author:author_id (
            full_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      // Update the discussion with the new reply
      setDiscussions(prev => prev.map(discussion => 
        discussion.id === discussionId 
          ? { ...discussion, replies: [...(discussion.replies || []), data] }
          : discussion
      ));

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Balasan berhasil dikirim');
    } catch (error) {
      console.error('Error replying to discussion:', error);
      toast.error('Gagal mengirim balasan');
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      proposal: 'bg-blue-500',
      guidance: 'bg-green-500',
      report: 'bg-orange-500',
      presentation: 'bg-purple-500'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  const getStageLabel = (stage: string) => {
    return stages.find(s => s.value === stage)?.label || stage;
  };

  useEffect(() => {
    fetchDiscussions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Forum Diskusi</h2>
          <p className="text-gray-600">Diskusi dengan dosen pembimbing untuk setiap tahapan KP</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Diskusi
        </Button>
      </div>

      {/* Create Discussion Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Buat Diskusi Baru</CardTitle>
            <CardDescription>
              Mulai diskusi baru dengan dosen pembimbing Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Tahapan</Label>
              <select
                id="stage"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newDiscussion.stage}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, stage: e.target.value }))}
              >
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul Diskusi</Label>
              <Input
                id="title"
                placeholder="Masukkan judul diskusi..."
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Isi Diskusi</Label>
              <Textarea
                id="content"
                placeholder="Tuliskan pertanyaan atau topik yang ingin didiskusikan..."
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateDiscussion} 
                disabled={!newDiscussion.title.trim() || !newDiscussion.content.trim()}
              >
                Buat Diskusi
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Belum ada diskusi. Mulai diskusi pertama Anda!</p>
            </CardContent>
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {discussion.author.full_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(discussion.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStageColor(discussion.stage)}>
                    {getStageLabel(discussion.stage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
                  
                  {/* Replies */}
                  {discussion.replies && discussion.replies.length > 0 && (
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                      {discussion.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">{reply.author.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {reply.author.role === 'supervisor' ? 'Dosen' : 'Mahasiswa'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(reply.created_at), 'dd MMM HH:mm', { locale: id })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === discussion.id ? (
                    <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                      <Textarea
                        placeholder="Tulis balasan Anda..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleReply(discussion.id)}
                          disabled={!replyContent.trim()}
                        >
                          Kirim Balasan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReplyingTo(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReplyingTo(discussion.id)}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Balas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default KpDiscussions;
