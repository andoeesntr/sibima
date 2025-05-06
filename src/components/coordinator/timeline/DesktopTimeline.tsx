
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { TimelineDisplayProps } from './types';

const DesktopTimeline = ({ steps, onEditStep }: TimelineDisplayProps) => {
  return (
    <div className="relative py-8 px-4">
      {/* Main horizontal line */}
      <div className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-600 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"></div>
      
      <div className="grid grid-cols-6 relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative px-2">
            {/* Circle marker */}
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-orange-500 z-10 flex items-center justify-center">
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            
            {/* Content - alternating top/bottom */}
            <div className={`${index % 2 === 0 ? 'mt-8' : '-mt-32'}`}>
              <div className="bg-white rounded-lg border border-gray-200 shadow p-4 mx-auto relative group">
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
                  <p className="text-gray-600 text-sm mt-2">{step.description}</p>
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
