import React from "react";

interface TimelineProps {
  children: React.ReactNode;
}

export const Timeline = ({ children }: TimelineProps) => (
  <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
    {children}
  </div>
);

export const TimelineItem = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex items-start">
    {children}
  </div>
);

export const TimelineConnector = () => (
  <div className="absolute top-10 left-5 h-full md:left-1/2 md:-translate-x-px w-px bg-slate-200" />
);

export const TimelineIcon = ({ className = "" }: { className?: string }) => (
  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white shadow-md text-slate-500 z-10 md:mx-auto">
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  </div>
);

export const TimelineHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-4 md:w-1/2 md:ml-0 md:pl-12 md:pr-8">
    <div className="flex items-start">{children}</div>
  </div>
);

export const TimelineBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`ml-4 md:w-1/2 md:ml-0 md:pl-12 md:pr-8 ${className}`}>
    {children}
  </div>
);