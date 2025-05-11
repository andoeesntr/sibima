
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Grid, BookOpen, User, FileSignature, FileText } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import KpTimeline from "@/components/coordinator/KpTimeline";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignedStudents, setAssignedStudents] = useState<number>(0);
  const [pendingProposals, setPendingProposals] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch assigned students count
        const { count: studentCount, error: studentError } = await supabase
          .from('teams_supervisors')
          .select('*', { count: 'exact', head: true })
          .eq('supervisor_id', user.id);
          
        if (studentError) throw studentError;
        setAssignedStudents(studentCount || 0);
        
        // Fetch pending proposals count
        const { count: proposalCount, error: proposalError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('supervisor_id', user.id)
          .eq('status', 'submitted');
          
        if (proposalError) throw proposalError;
        setPendingProposals(proposalCount || 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const dashboardItems = [
    {
      title: "Mahasiswa Bimbingan",
      value: loading ? "..." : assignedStudents,
      description: "Total mahasiswa bimbingan",
      icon: <User className="h-5 w-5 text-blue-500" />,
      action: () => navigate("/supervisor/feedback"),
      actionText: "Lihat Mahasiswa"
    },
    {
      title: "Proposal Masuk",
      value: loading ? "..." : pendingProposals,
      description: "Proposal yang perlu direview",
      icon: <FileText className="h-5 w-5 text-green-500" />,
      action: () => navigate("/supervisor/feedback"),
      actionText: "Review Proposal"
    },
    {
      title: "Tanda Tangan Digital",
      value: "Upload",
      description: "Tanda tangan untuk dokumen KP",
      icon: <FileSignature className="h-5 w-5 text-purple-500" />,
      action: () => navigate("/supervisor/digital-signature"),
      actionText: "Upload Tanda Tangan"
    },
    {
      title: "Panduan KP",
      value: "Info",
      description: "Informasi dan panduan KP",
      icon: <BookOpen className="h-5 w-5 text-amber-500" />,
      action: () => {},
      actionText: "Baca Panduan"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardItems.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={item.action}
              >
                {item.actionText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas terkait KP mahasiswa</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p>Belum ada aktivitas terbaru</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Bimbingan</CardTitle>
            <CardDescription>Jadwal bimbingan KP bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p>Belum ada jadwal bimbingan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* KP Timeline - Non-readonly for supervisors, they can also edit like coordinators */}
      <KpTimeline readOnly={false} />
    </div>
  );
};

export default SupervisorDashboard;
