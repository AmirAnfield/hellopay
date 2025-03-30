"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
  icon?: React.ReactNode;
}

export function HelpTooltip({
  content,
  side = "top",
  align = "center",
  className,
  iconClassName,
  icon,
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "inline-flex items-center justify-center cursor-help ml-1", 
              className
            )}
          >
            {icon || (
              <HelpCircle 
                className={cn(
                  "h-4 w-4 text-muted-foreground hover:text-foreground transition-colors", 
                  iconClassName
                )} 
              />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-sm text-sm">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 