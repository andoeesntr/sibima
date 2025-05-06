
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useMediaQuery } from "@/hooks/use-mobile";

type TimelineStep = {
  title: string;
  period: string;
  description?: string;
};

const KpTimeline = () => {
  const timelineSteps: TimelineStep[] = [
    {
      title: "Sosialisasi KP",
      period: "Juni",
      description: "Pengenalan program Kerja Praktik kepada mahasiswa"
    },
    {
      title: "Pendaftaran KP",
      period: "1 Juli",
      description: "Periode pendaftaran untuk program Kerja Praktik dibuka"
    },
    {
      title: "Penutupan Daftar KP",
      period: "7 Juli",
      description: "Batas akhir pendaftaran Kerja Praktik"
    },
    {
      title: "Pelaksanaan KP",
      period: "Agustus - Oktober",
      description: "Pelaksanaan Kerja Praktik selama 3 bulan dengan 8x bimbingan"
    },
    {
      title: "Bimbingan Terjadwal",
      period: "1 Minggu (2x)",
      description: "Bimbingan intensif terjadwal dengan dosen pembimbing"
    },
    {
      title: "Expo KP",
      period: "Oktober",
      description: "Presentasi hasil Kerja Praktik"
    },
  ];

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Kerja Praktik</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <MobileTimeline steps={timelineSteps} />
        ) : (
          <DesktopTimeline steps={timelineSteps} />
        )}
      </CardContent>
    </Card>
  );
};

const DesktopTimeline = ({ steps }: { steps: TimelineStep[] }) => {
  return (
    <div className="relative py-8 px-4">
      {/* Main horizontal line */}
      <div className="absolute h-1 bg-gradient-to-r from-orange-400 to-orange-600 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"></div>
      
      <div className="grid grid-cols-6 relative">
        {steps.map((step, index) => (
          <div key={index} className="relative px-2">
            {/* Circle marker */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-orange-500 z-10"></div>
            
            {/* Content - alternating top/bottom */}
            <div className={`mt-8 ${index % 2 === 0 ? '' : 'md:-mt-28'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mx-auto">
                <span className="text-orange-500 font-bold text-sm block mb-1">{step.period}</span>
                <h3 className="font-medium text-gray-900 text-base">{step.title}</h3>
                {step.description && (
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileTimeline = ({ steps }: { steps: TimelineStep[] }) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {steps.map((step, index) => (
          <CarouselItem key={index}>
            <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <span className="text-orange-600 font-bold">{index + 1}</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg">{step.title}</h3>
                  <span className="text-orange-500 font-medium text-sm">{step.period}</span>
                </div>
              </div>
              {step.description && (
                <p className="text-gray-600">{step.description}</p>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4 gap-2">
        <CarouselPrevious className="relative inset-auto transform-none" />
        <CarouselNext className="relative inset-auto transform-none" />
      </div>
    </Carousel>
  );
};

export default KpTimeline;
