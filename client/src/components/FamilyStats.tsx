import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { calculateAge } from "@/lib/family-data";

export default function FamilyStats() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/family-members"]
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow p-4 mt-6">
        <CardContent className="p-0">
          <h2 className="text-lg font-semibold mb-4">Family Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!members || members.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow p-4 mt-6">
        <CardContent className="p-0">
          <h2 className="text-lg font-semibold mb-4">Family Stats</h2>
          <p className="text-gray-500 text-center">No family data available</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate stats
  const totalMembers = members.length;
  
  const generations = new Set(members.map(member => member.generation));
  const totalGenerations = generations.size;
  
  const livingMembers = members.filter(member => !member.deathDate);
  
  // Find oldest member
  let oldestMember = null;
  let oldestAge = -1;
  
  members.forEach(member => {
    const age = calculateAge(member.birthDate);
    if (age && age > oldestAge) {
      oldestAge = age;
      oldestMember = member;
    }
  });
  
  // Find newest member (youngest)
  let newestMember = null;
  let youngestAge = Infinity;
  
  livingMembers.forEach(member => {
    const age = calculateAge(member.birthDate);
    if (age && age < youngestAge) {
      youngestAge = age;
      newestMember = member;
    }
  });

  return (
    <Card className="bg-white rounded-lg shadow p-4 mt-6">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold mb-4">Family Stats</h2>
        <div className="space-y-3">
          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-gray-600">Total Members:</span>
            <span className="font-medium">{totalMembers}</span>
          </motion.div>
          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="text-gray-600">Generations:</span>
            <span className="font-medium">{totalGenerations}</span>
          </motion.div>
          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span className="text-gray-600">Oldest Member:</span>
            <span className="font-medium">
              {oldestMember ? `${oldestMember.name} (${oldestAge})` : "N/A"}
            </span>
          </motion.div>
          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <span className="text-gray-600">Newest Addition:</span>
            <span className="font-medium">
              {newestMember ? `${newestMember.name} (${youngestAge})` : "N/A"}
            </span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
