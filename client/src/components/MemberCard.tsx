import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyMember } from "@shared/schema";
import { formatAge } from "@/lib/family-data";

interface MemberCardProps {
  memberId: number;
  isExpanded?: boolean;
  showDetails?: boolean;
  onClick: (id: number) => void;
}

export default function MemberCard({ 
  memberId, 
  isExpanded = false, 
  showDetails = true,
  onClick 
}: MemberCardProps) {
  const { data: member, isLoading, error } = useQuery({
    queryKey: [`/api/family-members/${memberId}`]
  });
  
  const [expanded, setExpanded] = useState(isExpanded);

  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md p-4 node-card">
        <CardContent className="p-0">
          <div className="flex items-start">
            <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
            <div className="ml-4">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          {showDetails && (
            <div className="mt-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error || !member) {
    return (
      <Card className="w-full max-w-md p-4 node-card bg-red-50">
        <CardContent className="p-0">
          <p className="text-red-500">Error loading member data</p>
        </CardContent>
      </Card>
    );
  }

  const renderCompactCard = () => (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div 
        className={`w-12 h-12 rounded-full bg-gray-100 overflow-hidden border-2 ${
          member.generation === 1 ? "border-indigo-600" : /* Indigo */
          member.generation === 2 ? "border-blue-500" :   /* Blue */
          member.generation === 3 ? "border-cyan-500" :   /* Cyan */
          member.generation === 4 ? "border-emerald-500" : /* Emerald */
          member.generation === 5 ? "border-lime-500" :   /* Lime */
          member.generation === 6 ? "border-yellow-500" : /* Yellow */
          member.generation === 7 ? "border-orange-500" : /* Orange */
          member.generation === 8 ? "border-red-500" :    /* Red */
          member.generation === 9 ? "border-pink-500" :   /* Pink */
          member.generation === 10 ? "border-purple-500" : /* Purple */
          member.generation === 11 ? "border-indigo-400" : /* Lighter indigo */
          member.generation === 12 ? "border-sky-500" :   /* Sky blue */
          member.generation === 13 ? "border-teal-500" :  /* Teal */
          "border-gray-400"  /* Fallback */
        }`}
      >
        {member.imageUrl ? (
          <img 
            src={member.imageUrl} 
            alt={member.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-600 font-semibold">{member.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <h3 className="text-base font-semibold">{member.name}</h3>
        <p className="text-gray-500 text-xs">
          {member.birthDate} {member.deathDate ? `- ${member.deathDate}` : "- Present"}
        </p>
        <button 
          className="mt-1 text-primary hover:text-blue-700 text-xs"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onClick(member.id);
          }}
        >
          View details
        </button>
      </div>
    </motion.div>
  );

  const renderExpandedCard = () => (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div 
          className={`w-14 h-14 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border-2 ${
            member.generation === 1 ? "border-indigo-600" : /* Indigo */
            member.generation === 2 ? "border-blue-500" :   /* Blue */
            member.generation === 3 ? "border-cyan-500" :   /* Cyan */
            member.generation === 4 ? "border-emerald-500" : /* Emerald */
            member.generation === 5 ? "border-lime-500" :   /* Lime */
            member.generation === 6 ? "border-yellow-500" : /* Yellow */
            member.generation === 7 ? "border-orange-500" : /* Orange */
            member.generation === 8 ? "border-red-500" :    /* Red */
            member.generation === 9 ? "border-pink-500" :   /* Pink */
            member.generation === 10 ? "border-purple-500" : /* Purple */
            member.generation === 11 ? "border-indigo-400" : /* Lighter indigo */
            member.generation === 12 ? "border-sky-500" :   /* Sky blue */
            member.generation === 13 ? "border-teal-500" :  /* Teal */
            "border-gray-400"  /* Fallback */
          }`}
        >
          {member.imageUrl ? (
            <img 
              src={member.imageUrl} 
              alt={member.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-600 font-semibold">{member.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-gray-500 text-sm">
            {member.birthDate} {member.deathDate ? `- ${member.deathDate}` : "- Present"}
          </p>
          <div className="mt-1 flex items-center">
            {member.isPatriarch && (
              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Patriarch</Badge>
            )}
            {!member.isPatriarch && (
              <Badge className={`
                ${member.generation === 1 ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" : 
                member.generation === 2 ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : 
                member.generation === 3 ? "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" :
                member.generation === 4 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" :
                member.generation === 5 ? "bg-lime-100 text-lime-800 hover:bg-lime-200" :
                member.generation === 6 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                member.generation === 7 ? "bg-orange-100 text-orange-800 hover:bg-orange-200" :
                member.generation === 8 ? "bg-red-100 text-red-800 hover:bg-red-200" :
                member.generation === 9 ? "bg-pink-100 text-pink-800 hover:bg-pink-200" :
                member.generation === 10 ? "bg-purple-100 text-purple-800 hover:bg-purple-200" :
                member.generation === 11 ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" :
                member.generation === 12 ? "bg-sky-100 text-sky-800 hover:bg-sky-200" :
                member.generation === 13 ? "bg-teal-100 text-teal-800 hover:bg-teal-200" :
                "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                {member.generation === 1 ? "1st" :
                 member.generation === 2 ? "2nd" : 
                 member.generation === 3 ? "3rd" : 
                 `${member.generation}th`} Generation
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <>
          <div className="mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Age:</span>
              <span>{formatAge(member.birthDate, member.deathDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Occupation:</span>
              <span>{member.occupation || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Residence:</span>
              <span>{member.location || "N/A"}</span>
            </div>
          </div>
          <div className="mt-3 text-right">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-blue-700 p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                onClick(member.id);
              }}
            >
              View details <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
  
  if (member.generation === 3 || member.generation === 4) {
    return (
      <Card 
        className={`node-card bg-white border border-gray-200 rounded-lg shadow-sm p-3 w-full ${expanded ? "w-64" : "w-[150px]"}`}
        data-generation={member.generation}
        onClick={() => onClick(member.id)}
      >
        <CardContent className="p-0">
          {expanded ? renderExpandedCard() : renderCompactCard()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="node-card bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-64" 
      data-generation={member.generation}
      onClick={() => onClick(member.id)}
    >
      <CardContent className="p-0">
        {renderExpandedCard()}
      </CardContent>
    </Card>
  );
}
