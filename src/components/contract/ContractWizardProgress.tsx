import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

interface ContractWizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function ContractWizardProgress({ currentStep, totalSteps }: ContractWizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  index < currentStep 
                    ? 'bg-primary text-white' 
                    : index === currentStep 
                      ? 'bg-primary/20 text-primary border border-primary' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <CircleDashed className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}>
                Étape {index + 1}
              </span>
            </div>
            
            {index < totalSteps - 1 && (
              <div 
                className={`flex-1 h-1 mx-2 rounded transition-colors ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 