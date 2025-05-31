import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Reply, User, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Discussion {
  id: string;
  stage: string;
  title: string;
  content: string;
  author_id: string;
  student_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    full_name: string;
    role: string;
  } | null;
  student: {
    full_name: string;
    nim: string;
  } | null;
  replies?: Discussion[];
}

const SupervisorDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();

  const fetchDiscussions = async () => {
    if (!user?.id) return;

    try {
      // Get all students under this supervisor
      const { data: studentsData } = await supabase
        .from('proposals')
        .select('student_id')
        .eq('supervisor_id', user.id)
        .eq('status', 'approved');

      if (!studentsData || studentsData.length === 0) {
        setDiscussions([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsData.map(p => p.student_id);

      // Fetch discussions from all supervised students
      const { data, error } = await supabase
        .from('kp_discussions')
        .select(`
          *,
          author:profiles!kp_discussions_author_id_fkey (
            full_name,
            role
          ),
          student:profiles!kp_discussions_student_id_fkey (
            full_name,
            nim
          )
        `)
        .in('student_id', studentIds)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies, error: repliesError } = await supabase
            .from('kp_discussions')
            .select(`
              *,
              author:profiles!kp_discussions_author_id_fkey (
                full_name,
                role
              ),
              student:profiles!kp_discussions_student_id_fkey (
                full_name,
                nim
              )
            `)
            .eq('parent_id', discussion.id)
            .order('created_at', { ascending: true });

          if (repliesError) throw repliesError;

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

  const handleReply = async (discussionId: string) => {
    if (!user?.id || !replyContent.trim()) {
      toast.error('Konten balasan harus diisi');
      return;
    }

    try {
      // Get the original discussion to get student_id
      const originalDiscussion = discussions.find(d => d.id === discussionId);
      if (!originalDiscussion) {
        toast.error('Diskusi tidak ditemukan');
        return;
      }

      const { data, error } = await supabase
        .from('kp_discussions')
        .insert({
          student_id: originalDiscussion.student_id,
          author_id: user.id,
          parent_id: discussionId,
          stage: 'reply',
          title: 'Reply',
          content: replyContent
        })
        .select(`
          *,
          author:profiles!kp_discussions_author_id_fkey (
            full_name,
            role
          ),
          student:profiles!kp_discussions_student_id_fkey (
            full_name,
            nim
          )
        `)
        .single();

      if (error) throw error;

      // Update the discussions state
      setDiscussions(prev => prev.map(discussion => 
        discussion.id === discussionId 
          ? { ...discussion, replies: [...(discussion.replies || []), data] }
          : discussion
      ));

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Balasan berhasil dikirim');
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Gagal mengirim balasan');
    }
  };

  const getStageLabel = (stage: string) => {
    const stages = {
      general: 'Umum',
      proposal: 'Proposal',
      guidance: 'Bimbingan',
      report: 'Laporan',
      presentation: 'Sidang',
      reply: 'Balasan'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      general: 'bg-gray-500',
      proposal: 'bg-blue-500',
      guidance: 'bg-green-500',
      report: 'bg-orange-500',
      presentation: 'bg-purple-500',
      reply: 'bg-gray-400'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
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
      <div>
        <h2 className="text-xl font-semibold">Forum Diskusi</h2>
        <p className="text-gray-600">Kelola diskusi dengan mahasiswa bimbingan</p>
      </div>

      {discussions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Belum ada diskusi dari mahasiswa bimbingan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {discussion.author?.full_name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {discussion.student?.full_name} ({discussion.student?.nim})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
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
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">{reply.author?.full_name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(reply.created_at), 'dd MMM HH:mm', { locale: id })}
                            </span>
                            {reply.author?.role === 'supervisor' && (
                              <Badge variant="outline" className="text-xs">Dosen</Badge>
                            )}
                            {reply.author?.role === 'student' && (
                              <Badge variant="outline" className="text-xs">Mahasiswa</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === discussion.id ? (
                    <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                      <Textarea
                        placeholder="Tulis balasan Anda sebagai pembimbing..."
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
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setReplyingTo(discussion.id)}
                      className="flex items-center gap-2"
                    >
                      <Reply className="h-4 w-4" />
                      Balas sebagai Pembimbing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorDiscussions;
