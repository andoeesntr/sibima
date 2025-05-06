
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineSkeletonProps {
  isMobile: boolean;
}

const TimelineSkeleton = ({ isMobile }: TimelineSkeletonProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
        <div className="flex justify-center mt-4 gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-16 px-4">
      <div className="absolute h-1 bg-gray-200 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"></div>
      
      <div className="grid grid-cols-6 gap-2 relative">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="relative px-2">
            <Skeleton className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
            <div className="text-center mb-6 absolute -top-14 left-1/2 transform -translate-x-1/2 w-full px-2">
              <Skeleton className="h-5 w-20 mx-auto rounded-full" />
            </div>
            <div className={`${index % 2 === 0 ? 'mt-8' : '-mt-24'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mx-auto">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineSkeleton;
