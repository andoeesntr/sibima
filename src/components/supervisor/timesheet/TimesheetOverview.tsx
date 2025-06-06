
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, FileSpreadsheet, FileText, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { timesheetService, TimesheetEntry } from '@/services/timesheetService';
import * as XLSX from 'xlsx';

// Import jsPDF without type declaration issues
const jsPDF = require('jspdf');
require('jspdf-autotable');

interface WeeklyData {
  studentId: string;
  studentName: string;
  nim: string;
  days: {
    [key: string]: {
      startTime: string | null;
      endTime: string | null;
      duration: number;
      status: string;
      notes: string | null;
    };
  };
  totalMinutes: number;
}

const TimesheetOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    return startOfWeek.toISOString().split('T')[0];
  });

  const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  useEffect(() => {
    fetchTimesheets();
  }, [selectedWeek]);

  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedWeek);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday

      const data = await timesheetService.getAllTimesheets(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setTimesheets(data);
      processWeeklyData(data, startDate);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast.error('Gagal mengambil data timesheet');
    } finally {
      setIsLoading(false);
    }
  };

  const processWeeklyData = (data: TimesheetEntry[], startDate: Date) => {
    const studentGroups: { [key: string]: TimesheetEntry[] } = {};
    
    // Group by student
    data.forEach(entry => {
      if (!studentGroups[entry.student_id]) {
        studentGroups[entry.student_id] = [];
      }
      studentGroups[entry.student_id].push(entry);
    });

    const processed: WeeklyData[] = Object.entries(studentGroups).map(([studentId, entries]) => {
      const student = entries[0]?.student;
      const days: WeeklyData['days'] = {};
      let totalMinutes = 0;

      // Initialize all weekdays
      for (let i = 0; i < 5; i++) { // Monday to Friday
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const entry = entries.find(e => e.date === dateStr);
        
        if (entry) {
          days[dateStr] = {
            startTime: entry.start_time,
            endTime: entry.end_time,
            duration: entry.duration_minutes || 0,
            status: entry.status,
            notes: entry.notes
          };
          totalMinutes += entry.duration_minutes || 0;
        } else {
          days[dateStr] = {
            startTime: null,
            endTime: null,
            duration: 0,
            status: 'TIDAK_HADIR',
            notes: null
          };
        }
      }

      return {
        studentId,
        studentName: student?.full_name || 'Unknown',
        nim: student?.nim || 'Unknown',
        days,
        totalMinutes
      };
    });

    setWeeklyData(processed);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAKIT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IZIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LIBUR': return 'bg-red-100 text-red-800 border-red-200';
      case 'HADIR': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const exportToExcel = () => {
    const exportData = weeklyData.map(student => {
      const row: any = {
        'Nama': student.studentName,
        'NIM': student.nim
      };

      // Add each weekday
      for (let i = 0; i < 5; i++) {
        const currentDate = new Date(selectedWeek);
        currentDate.setDate(new Date(selectedWeek).getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = student.days[dateStr];
        
        if (dayData.status === 'HADIR') {
          row[weekDays[i]] = `${dayData.startTime} - ${dayData.endTime} (${formatDuration(dayData.duration)})`;
        } else {
          row[weekDays[i]] = dayData.status;
        }
      }

      row['Total Jam'] = formatDuration(student.totalMinutes);
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');
    XLSX.writeFile(wb, `Timesheet_${selectedWeek}.xlsx`);
    toast.success('Data berhasil diekspor ke Excel');
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    pdf.setFontSize(16);
    pdf.text('Rekap Timesheet Kerja Praktik', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Minggu: ${selectedWeek}`, 20, 30);

    const tableData = weeklyData.map(student => {
      const row = [student.studentName, student.nim];
      
      for (let i = 0; i < 5; i++) {
        const currentDate = new Date(selectedWeek);
        currentDate.setDate(new Date(selectedWeek).getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = student.days[dateStr];
        
        if (dayData.status === 'HADIR') {
          row.push(`${dayData.startTime}-${dayData.endTime}\n(${formatDuration(dayData.duration)})`);
        } else {
          row.push(dayData.status);
        }
      }
      
      row.push(formatDuration(student.totalMinutes));
      return row;
    });

    (pdf as any).autoTable({
      head: [['Nama', 'NIM', ...weekDays, 'Total']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [17, 97, 61], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    pdf.save(`Timesheet_${selectedWeek}.pdf`);
    toast.success('Data berhasil diekspor ke PDF');
  };

  const filteredData = weeklyData.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 p-6 rounded-lg text-white">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Rekap Timesheet Kerja Praktik</h1>
            <p className="text-green-100">Monitoring kehadiran mahasiswa</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-yellow-50 border-b border-yellow-200">
          <CardTitle className="text-green-800">Filter & Export</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="week" className="text-green-800 font-medium">Pilih Minggu</Label>
              <Input
                id="week"
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="border-green-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search" className="text-green-800 font-medium">Cari Mahasiswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nama atau NIM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-300 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="flex-1"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Table */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-yellow-50 border-b border-yellow-200">
          <CardTitle className="text-green-800">
            Rekap Kehadiran - Minggu {selectedWeek}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nama</th>
                  <th className="px-4 py-3 text-left font-medium">NIM</th>
                  {weekDays.map((day, index) => (
                    <th key={day} className="px-4 py-3 text-center font-medium min-w-[120px]">
                      {day}
                      <br />
                      <span className="text-xs text-yellow-200">
                        {new Date(new Date(selectedWeek).getTime() + index * 24 * 60 * 60 * 1000)
                          .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data timesheet
                    </td>
                  </tr>
                ) : (
                  filteredData.map((student, index) => (
                    <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-green-800">{student.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{student.nim}</td>
                      {Object.entries(student.days).map(([date, data]) => (
                        <td key={date} className="px-4 py-3 text-center">
                          {data.status === 'HADIR' ? (
                            <div className="text-sm">
                              <div className="font-medium text-green-700">
                                {data.startTime} - {data.endTime}
                              </div>
                              <div className="text-xs text-gray-500">
                                ({formatDuration(data.duration)})
                              </div>
                            </div>
                          ) : data.status === 'TIDAK_HADIR' ? (
                            <span className="text-xs text-gray-400">-</span>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(data.status)}`}>
                              {data.status}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-bold text-green-800">
                        {formatDuration(student.totalMinutes)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetOverview;
