import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const stepLabels = ["Info", "Number", "Forward", "Ready"];

export const StepProgress = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-sm mx-auto mb-8">
      {stepLabels.map((label, index) => {
        const stepNum = index + 1;
        const isComplete = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        const isUpcoming = currentStep < stepNum;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-base",
                  isComplete && "bg-step-complete text-success-foreground",
                  isActive && "bg-step-active text-primary-foreground",
                  isUpcoming && "bg-step-inactive text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 animate-check-appear" />
                ) : (
                  stepNum
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isComplete && "text-success",
                  isActive && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < stepLabels.length - 1 && (
              <div className="flex-1 mx-1.5 sm:mx-2 mb-5">
                <div
                  className={cn(
                    "h-0.5 rounded-full transition-base",
                    currentStep > stepNum + 1
                      ? "bg-step-complete"
                      : currentStep > stepNum
                      ? "bg-step-active"
                      : "bg-step-inactive"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
