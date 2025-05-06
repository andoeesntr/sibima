
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import GuidanceSessionsList from '@/components/coordinator/guidance/GuidanceSessionsList';
import ScheduleGuidanceForm from '@/components/coordinator/guidance/ScheduleGuidanceForm';
import { GuidanceSession } from '@/services/guidanceService';

const GuidanceManagement = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GuidanceSession | null>(null);
  const [activeTab, setActiveTab] = useState('sessions');

  const handleScheduleSuccess = () => {
    setIsScheduleDialogOpen(false);
    // Add any refresh logic here if needed
  };

  const handleViewReport = (session: GuidanceSession) => {
    setSelectedSession(session);
    // Add logic to fetch and show the report
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Bimbingan KP</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="sessions">Sesi Bimbingan</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions" className="pt-4">
          <GuidanceSessionsList 
            onAddSession={() => setIsScheduleDialogOpen(true)} 
            onViewReport={handleViewReport}
          />
        </TabsContent>
        
        <TabsContent value="reports" className="pt-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Laporan Bimbingan</h2>
            <p className="text-gray-500">Fitur ini akan segera tersedia.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="statistics" className="pt-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Statistik Bimbingan</h2>
            <p className="text-gray-500">Fitur ini akan segera tersedia.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Jadwalkan Bimbingan KP</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menjadwalkan sesi bimbingan KP.
            </DialogDescription>
          </DialogHeader>
          <ScheduleGuidanceForm onSuccess={handleScheduleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuidanceManagement;
