import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DigitalSignature = () => {
  const [activeTab, setActiveTab] = useState('qrcode');
  const [isLoading, setIsLoading] = useState(true);
  const [hasApprovedProposal, setHasApprovedProposal] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSignatureData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        console.log('=== Debug: Fetching signature data for student ===');
        console.log('Student ID:', user.id);
        
        // Step 1: Check if user has an approved proposal
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select(`
            id, 
            status,
            supervisor_id,
            student_id,
            title,
            team_id,
            created_at
          `)
          .eq('student_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('=== Debug: Proposal Query Result ===');
        console.log('Proposal data:', proposalData);
        console.log('Proposal error:', proposalError);

        if (proposalError && proposalError.code !== 'PGRST116') {
          console.error('Error checking proposal status:', proposalError);
          toast.error('Gagal memeriksa status proposal');
          return;
        }

        // If no approved proposal found
        if (!proposalData || proposalData.status !== 'approved') {
          console.log('No approved proposal found for student');
          setHasApprovedProposal(false);
          setIsLoading(false);
          return;
        }

        setHasApprovedProposal(true);
        console.log('=== Debug: Approved proposal found ===');
        console.log('Proposal ID:', proposalData.id);
        console.log('Supervisor ID:', proposalData.supervisor_id);
        console.log('Team ID:', proposalData.team_id);

        let supervisorIds: string[] = [];
        let foundSupervisorName = '';

        // Step 2: Get supervisor IDs - check both direct supervisor and team supervisors
        if (proposalData.supervisor_id) {
          console.log('=== Debug: Using direct supervisor ID ===');
          supervisorIds.push(proposalData.supervisor_id);
        } else if (proposalData.team_id) {
          console.log('=== Debug: No direct supervisor, checking team supervisors ===');
          
          // Fetch team supervisors
          const { data: teamSupervisors, error: teamSupervisorsError } = await supabase
            .from('team_supervisors')
            .select(`
              supervisor_id,
              profiles:supervisor_id (
                id, 
                full_name, 
                email
              )
            `)
            .eq('team_id', proposalData.team_id);
          
          console.log('=== Debug: Team Supervisors Query ===');
          console.log('Team supervisors data:', teamSupervisors);
          console.log('Team supervisors error:', teamSupervisorsError);
          
          if (!teamSupervisorsError && teamSupervisors && teamSupervisors.length > 0) {
            supervisorIds = teamSupervisors.map(ts => ts.supervisor_id);
            // Get first supervisor name for display
            const firstSupervisor = teamSupervisors[0]?.profiles;
            if (firstSupervisor) {
              foundSupervisorName = firstSupervisor.full_name || firstSupervisor.email;
            }
            console.log('=== Debug: Found team supervisor IDs ===', supervisorIds);
            console.log('=== Debug: First supervisor name ===', foundSupervisorName);
          }
        }

        if (supervisorIds.length === 0) {
          console.log('❌ No supervisors found for this proposal');
          setIsLoading(false);
          return;
        }

        // Step 3: For each supervisor, check if they have an approved digital signature
        let foundSignature = null;
        let foundSupervisorProfile = null;

        for (const supervisorId of supervisorIds) {
          console.log(`=== Debug: Checking supervisor ${supervisorId} ===`);
          
          // Get supervisor profile if we don't have name yet
          if (!foundSupervisorName) {
            const { data: supervisorProfile, error: supervisorError } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', supervisorId)
              .single();
              
            console.log('Supervisor profile data:', supervisorProfile);
            console.log('Supervisor profile error:', supervisorError);

            if (!supervisorError && supervisorProfile) {
              foundSupervisorProfile = supervisorProfile;
              foundSupervisorName = supervisorProfile.full_name || supervisorProfile.email;
            }
          }
          
          // Check for approved digital signature
          console.log('=== Debug: Fetching digital signature ===');
          
          const { data: signatureData, error: signatureError } = await supabase
            .from('digital_signatures')
            .select('id, signature_url, qr_code_url, status, created_at, updated_at')
            .eq('supervisor_id', supervisorId)
            .eq('status', 'approved')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
              
          console.log(`=== Debug: Digital Signature Query Result for ${supervisorId} ===`);
          console.log('Signature data:', signatureData);
          console.log('Signature error:', signatureError);
              
          if (!signatureError && signatureData) {
            console.log('=== Digital signature found and approved ===');
            console.log('Signature URL:', signatureData.signature_url);
            console.log('QR Code URL:', signatureData.qr_code_url);
            
            foundSignature = signatureData;
            break; // Use first approved signature found
          }
        }

        // Set supervisor name
        setSupervisorName(foundSupervisorName || "Dosen Pembimbing");

        if (foundSignature) {
          setSignatureUrl(foundSignature.signature_url);
          setQrCodeUrl(foundSignature.qr_code_url);
          
          // Additional debug logging
          if (foundSignature.qr_code_url) {
            console.log('✅ QR Code is available for student');
          } else {
            console.log('⚠️ QR Code URL is null or empty');
          }
          
          if (foundSignature.signature_url) {
            console.log('✅ Signature is available for student');
          } else {
            console.log('⚠️ Signature URL is null or empty');
          }
        } else {
          console.log('❌ No approved digital signature found from any supervisor');
          console.log('This could mean:');
          console.log('1. Supervisor(s) have not uploaded signature yet');
          console.log('2. Signature exists but not approved by admin yet');
          console.log('3. Database connection issue');
          
          // Let's check if there are any signatures at all for these supervisors
          for (const supervisorId of supervisorIds) {
            const { data: allSignatures, error: allSigError } = await supabase
              .from('digital_signatures')
              .select('id, status, created_at')
              .eq('supervisor_id', supervisorId);
              
            console.log(`=== All signatures for supervisor ${supervisorId} ===`);
            console.log('All signatures:', allSignatures);
            console.log('Error:', allSigError);
          }
        }

      } catch (error) {
        console.error('=== Unexpected error in fetchSignatureData ===', error);
        toast.error('Terjadi kesalahan saat memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignatureData();
  }, [user]);

  const downloadWithLogo = async (url: string, filename: string, type: 'qrcode' | 'signature') => {
    if (!url) {
      toast.error(`${type === 'qrcode' ? 'QR Code' : 'Tanda Tangan Digital'} belum tersedia`);
      return;
    }

    try {
      if (type === 'qrcode') {
        // Create QR code with embedded logo for download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;
        
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        
        qrImg.onload = () => {
          // Draw QR code
          ctx!.drawImage(qrImg, 0, 0, 400, 400);
          
          // Load and draw logo
          const logoImg = new Image();
          logoImg.onload = () => {
            // Calculate logo position and size
            const logoSize = 80;
            const x = (400 - logoSize) / 2;
            const y = (400 - logoSize) / 2;
            
            // Draw white background circle for logo
            ctx!.fillStyle = '#FFFFFF';
            ctx!.beginPath();
            ctx!.arc(200, 200, logoSize / 2 + 8, 0, 2 * Math.PI);
            ctx!.fill();
            
            // Add border
            ctx!.strokeStyle = '#E0E0E0';
            ctx!.lineWidth = 2;
            ctx!.stroke();
            
            // Draw logo
            ctx!.drawImage(logoImg, x, y, logoSize, logoSize);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
              if (blob) {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                toast.success(`Berhasil mengunduh ${type === 'qrcode' ? 'QR Code dengan Logo SI' : 'Tanda Tangan Digital'}`);
              }
            });
          };
          logoImg.src = '/LogoSI-removebg-preview.png';
        };
        
        qrImg.src = url;
      } else {
        // Regular download for signature
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(`Berhasil mengunduh Tanda Tangan Digital`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Gagal mengunduh ${type === 'qrcode' ? 'QR Code' : 'Tanda Tangan Digital'}`);
    }
  };

  const handleDownload = async (type: 'qrcode' | 'signature') => {
    const url = type === 'qrcode' ? qrCodeUrl : signatureUrl;
    const filename = type === 'qrcode' ? 'qr_code_validasi_dengan_logo_si.png' : 'tanda_tangan_digital.png';
    
    await downloadWithLogo(url!, filename, type);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Memeriksa status proposal dan tanda tangan...</p>
      </div>
    );
  }

  if (!hasApprovedProposal) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Digital Signature</h1>
        <p className="text-gray-600">
          Download tanda tangan digital dan QR code untuk dokumen KP Anda
        </p>
        
        <Alert className="max-w-lg mx-auto">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-500 font-medium">Akses Tidak Tersedia</AlertTitle>
          <AlertDescription className="text-gray-600">
            Anda belum dapat mengakses tanda tangan digital dan QR Code karena proposal KP Anda belum disetujui.
            Silakan ajukan proposal KP terlebih dahulu atau hubungi koordinator KP jika Anda yakin ini adalah kesalahan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show a message if signature or QR code are not available
  if (!signatureUrl && !qrCodeUrl) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Digital Signature</h1>
        <p className="text-gray-600">
          Download tanda tangan digital dan QR code untuk dokumen KP Anda
        </p>
        
        <Alert className="max-w-lg mx-auto">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-500 font-medium">Tanda Tangan Belum Tersedia</AlertTitle>
          <AlertDescription className="text-gray-600">
            Dosen pembimbing Anda ({supervisorName || 'belum diketahui'}) belum mengupload tanda tangan digital atau tanda tangan belum disetujui oleh admin.
            Silakan hubungi dosen pembimbing Anda untuk mengupload tanda tangan digital, atau hubungi admin untuk approval.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Digital Signature</h1>
      <p className="text-gray-600">
        Download tanda tangan digital dan QR code untuk dokumen KP Anda
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          <TabsTrigger value="signature">Tanda Tangan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Validasi dengan Logo SI</CardTitle>
              <CardDescription>
                QR Code dengan logo SI di tengah untuk memvalidasi dokumen KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <div className="border p-4 rounded-lg bg-gray-50">
                {qrCodeUrl ? (
                  <div className="relative bg-white p-2 rounded">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code Validasi dengan Logo SI" 
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        console.error('Error loading QR code:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Logo overlay untuk referensi visual - always visible */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-2">
                        <img 
                          src="/LogoSI-removebg-preview.png" 
                          alt="Logo SI" 
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center bg-gray-100 rounded">
                    <QrCode className="text-gray-400 h-16 w-16 mb-4" />
                    <p className="text-gray-500 text-center px-4">
                      QR Code belum tersedia. Silakan hubungi dosen pembimbing ({supervisorName || 'belum diketahui'}).
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
              <Button 
                onClick={() => setShowQRDialog(true)}
                className="bg-primary hover:bg-primary/90"
                disabled={!qrCodeUrl}
              >
                <QrCode size={16} className="mr-2" /> Lihat QR Code
              </Button>
              <Button 
                onClick={() => handleDownload('qrcode')}
                variant="outline"
                disabled={!qrCodeUrl}
              >
                <Download size={16} className="mr-2" /> Download QR Code
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle>Tanda Tangan Digital</CardTitle>
              <CardDescription>
                Tanda tangan digital dosen pembimbing untuk dokumen KP Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="mb-4 p-6 bg-gray-50 rounded-lg">
                  {signatureUrl ? (
                    <img 
                      src={signatureUrl} 
                      alt="Digital Signature" 
                      className="w-64 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-32 flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Tanda tangan belum tersedia</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src="/placeholder.svg" alt={supervisorName} />
                    <AvatarFallback>{supervisorName ? supervisorName.charAt(0) : 'D'}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{supervisorName || "Dosen Pembimbing"}</p>
                  <p className="text-sm text-gray-600">Dosen Pembimbing KP</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => handleDownload('signature')}
                className="bg-primary hover:bg-primary/90"
                disabled={!signatureUrl}
              >
                <Download size={16} className="mr-2" /> Download Tanda Tangan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Validasi dengan Logo SI</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {qrCodeUrl && (
              <div className="relative bg-white p-4 rounded-lg border">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Validasi dengan Logo SI" 
                  className="w-80 h-80 object-contain border p-2 rounded"
                  onError={(e) => {
                    console.error('Error loading QR code in dialog:', e);
                  }}
                />
                {/* Enhanced logo overlay untuk dialog */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                    <img 
                      src="/LogoSI-removebg-preview.png" 
                      alt="Logo SI" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Scan QR code ini untuk memvalidasi dokumen dengan logo SI. Logo akan selalu tampil untuk verifikasi resmi.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (qrCodeUrl) {
                    // Open with logo overlay intact
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head><title>QR Code dengan Logo SI</title></head>
                          <body style="margin:0; padding:20px; display:flex; flex-direction:column; align-items:center; font-family:Arial,sans-serif; background:#f5f5f5;">
                            <h2 style="color:#333; margin-bottom:20px;">QR Code Validasi dengan Logo SI</h2>
                            <div style="position:relative; background:white; padding:20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); border:1px solid #e0e0e0;">
                              <img src="${qrCodeUrl}" alt="QR Code" style="width:350px; height:350px; object-fit:contain; display:block;">
                              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:70px; height:70px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.15); border:2px solid #e5e5e5;">
                                <img src="${window.location.origin}/LogoSI-removebg-preview.png" alt="Logo SI" style="width:54px; height:54px; object-fit:contain;">
                              </div>
                            </div>
                            <p style="margin-top:20px; color:#666; text-align:center; max-width:400px; line-height:1.5;">QR Code dengan Logo SI untuk verifikasi dokumen resmi Fakultas Sains dan Informatika UNJANI</p>
                          </body>
                        </html>
                      `);
                    }
                  }
                }}
              >
                Buka di Tab Baru
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDownload('qrcode')}
                className="text-blue-600 border-blue-600"
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start">
          <QrCode size={24} className="text-blue-500 mr-3 mt-1" />
          <div>
            <h3 className="font-medium text-blue-700">Petunjuk Penggunaan</h3>
            <p className="text-sm text-blue-600 mt-1">
              Tempelkan QR Code dan tanda tangan digital pada dokumen KP Anda di tempat yang sesuai. 
              QR Code ini akan digunakan untuk memvalidasi keaslian dokumen dan tanda tangan digital 
              dosen pembimbing Anda. QR Code dilengkapi dengan logo SI di tengah untuk verifikasi resmi 
              Fakultas Sains dan Informatika UNJANI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalSignature;
