
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { TimelineDisplayProps } from './types';

const DesktopTimeline = ({ steps, onEditStep }: TimelineDisplayProps) => {
  return (
    <div className="relative py-12">
      {/* Main horizontal line */}
      <div className="absolute h-1.5 bg-orange-500 top-12 left-0 right-0 transform -translate-y-1/2"></div>
      
      <div className="flex justify-between relative">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className="relative px-2 flex flex-col items-center" 
            style={{ width: `${100 / steps.length}%` }}
          >
            {/* Circle marker */}
            <div className="absolute top-[12px] transform -translate-y-1/2 w-7 h-7 bg-white rounded-full border-3 border-orange-500 z-10 flex items-center justify-center">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            
            {/* Content - alternate top/bottom positioning */}
            <div className={`w-full ${index % 2 === 0 ? 'mt-16' : '-mt-24'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow p-4 relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEditStep(step)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <span className="text-orange-500 font-bold text-sm block mb-1">{step.period}</span>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                {step.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{step.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopTimeline;
