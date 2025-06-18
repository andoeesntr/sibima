
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Users } from 'lucide-react';
import SupervisorScheduledGuidance from './SupervisorScheduledGuidance';

const SupervisorGuidanceManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('scheduled');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manajemen Bimbingan</h3>
          <p className="text-gray-600">Kelola jadwal dan permintaan bimbingan mahasiswa</p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bimbingan Terjadwal</span>
            <span className="sm:hidden">Terjadwal</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Permintaan Bimbingan</span>
            <span className="sm:hidden">Permintaan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled">
          <SupervisorScheduledGuidance />
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Permintaan Bimbingan Mahasiswa
              </CardTitle>
              <CardDescription>
                Kelola permintaan bimbingan dari mahasiswa bimbingan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Fitur permintaan bimbingan akan segera tersedia</p>
                <p className="text-sm text-gray-400 mt-2">
                  Saat ini fokus pada bimbingan terjadwal yang wajib
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorGuidanceManagement;
