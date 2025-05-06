import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Image, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { findRelatives } from "@/lib/family-data";

interface MemberDetailProps {
  memberId: number | null;
  onClose: () => void;
}

export default function MemberDetail({ memberId, onClose }: MemberDetailProps) {
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: memberId ? [`/api/family-members/${memberId}`] : null,
    enabled: !!memberId
  });
  
  const { data: allMembers, isLoading: allMembersLoading } = useQuery({
    queryKey: ["/api/family-members"],
    enabled: !!memberId
  });
  
  const isLoading = memberLoading || allMembersLoading;

  if (!memberId) return null;
  
  let relatives = { parents: [], siblings: [], children: [] };
  if (member && allMembers) {
    relatives = findRelatives(member, allMembers);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-t-lg border-b">
            <h2 className="text-lg font-semibold">Selected Family Member</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="md:flex">
                <div className="md:flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <Skeleton className="h-48 w-full md:w-48 rounded-lg" />
                </div>
                <div className="md:flex-1">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-6" />
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-36 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-36 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </div>
                </div>
              </div>
            ) : member ? (
              <div className="md:flex">
                <motion.div 
                  className="md:flex-shrink-0 mb-4 md:mb-0 md:mr-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {member.imageUrl ? (
                    <img 
                      className="h-48 w-full md:w-48 object-cover rounded-lg shadow" 
                      src={member.imageUrl}
                      alt={`${member.name} portrait`} 
                    />
                  ) : (
                    <div className="h-48 w-full md:w-48 rounded-lg bg-gray-200 flex items-center justify-center shadow">
                      <span className="text-4xl text-gray-400 font-light">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="md:flex-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {member.generation === 1 ? "1st" : 
                       member.generation === 2 ? "2nd" : 
                       member.generation === 3 ? "3rd" : 
                       member.generation === 4 ? "4th" : ""} Generation
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">
                    Born {member.birthDate} 
                    {!member.deathDate && (
                      <span> ({new Date().getFullYear() - parseInt(member.birthDate)} years old)</span>
                    )}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Family Relationships</h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex">
                          <span className="text-gray-600 w-24">Parents:</span>
                          <span className="text-gray-900">
                            {relatives.parents.length > 0 
                              ? relatives.parents.map(p => p.name).join(", ") 
                              : "None recorded"}
                          </span>
                        </li>
                        <li className="flex">
                          <span className="text-gray-600 w-24">Siblings:</span>
                          <span className="text-gray-900">
                            {relatives.siblings.length > 0 
                              ? relatives.siblings.map(s => s.name).join(", ") 
                              : "None"}
                          </span>
                        </li>
                        <li className="flex">
                          <span className="text-gray-600 w-24">Children:</span>
                          <span className="text-gray-900">
                            {relatives.children.length > 0 
                              ? relatives.children.map(c => c.name).join(", ") 
                              : "None"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Personal Details</h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex">
                          <span className="text-gray-600 w-24">Occupation:</span>
                          <span className="text-gray-900">{member.occupation || "Not specified"}</span>
                        </li>
                        <li className="flex">
                          <span className="text-gray-600 w-24">Education:</span>
                          <span className="text-gray-900">{member.education || "Not specified"}</span>
                        </li>
                        <li className="flex">
                          <span className="text-gray-600 w-24">Location:</span>
                          <span className="text-gray-900">{member.location || "Not specified"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500">Biography</h4>
                    <p className="mt-2 text-gray-700">
                      {member.biography || "No biography available."}
                    </p>
                  </div>
                  
                  <motion.div 
                    className="mt-6 flex space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button>
                      <Edit className="h-4 w-4 mr-1" /> Edit Details
                    </Button>
                    <Button variant="outline">
                      <Image className="h-4 w-4 mr-1" /> Photo Gallery
                    </Button>
                    <Button variant="outline">
                      <History className="h-4 w-4 mr-1" /> Timeline
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Member not found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
