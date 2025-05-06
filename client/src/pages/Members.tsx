import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, CheckIcon, FilterIcon, SlidersIcon } from "lucide-react";
import MemberCard from "@/components/MemberCard";
import MemberDetail from "@/components/MemberDetail";

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/family-members"]
  });
  
  const filteredMembers = members?.filter(member => {
    // Filter by generation if selected
    if (selectedGeneration !== null && member.generation !== selectedGeneration) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const generations = members ? [...new Set(members.map(m => m.generation))].sort() : [];
  
  const handleSelectMember = (id: number) => {
    setSelectedMemberId(id);
  };
  
  const handleCloseDetail = () => {
    setSelectedMemberId(null);
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow rounded-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Family Members</h1>
            
            <div className="w-full md:w-auto flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <Button variant="outline" size="icon">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <SlidersIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Generation:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGeneration === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGeneration(null)}
                className="rounded-full"
              >
                All {selectedGeneration === null && <CheckIcon className="h-3 w-3 ml-1" />}
              </Button>
              
              {generations.map(gen => (
                <Button
                  key={gen}
                  variant={selectedGeneration === gen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGeneration(gen)}
                  className="rounded-full"
                >
                  {gen === 1 ? "1st" : 
                   gen === 2 ? "2nd" : 
                   gen === 3 ? "3rd" : 
                   `${gen}th`} Generation
                  {selectedGeneration === gen && <CheckIcon className="h-3 w-3 ml-1" />}
                </Button>
              ))}
            </div>
          </div>
          
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredMembers && filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMembers.map(member => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MemberCard
                        memberId={member.id}
                        isExpanded={true}
                        onClick={handleSelectMember}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No members found matching your criteria</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <CardContent className="p-0">
                        <Skeleton className="h-6 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredMembers && filteredMembers.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Generation</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Birth Year</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Occupation</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredMembers.map(member => (
                        <motion.tr 
                          key={member.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleSelectMember(member.id)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 flex items-center">
                            {member.imageUrl ? (
                              <img 
                                src={member.imageUrl} 
                                alt={member.name} 
                                className="h-8 w-8 rounded-full mr-3" 
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-xs text-gray-600">{member.name.charAt(0)}</span>
                              </div>
                            )}
                            {member.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              {member.generation === 1 ? "1st" : 
                               member.generation === 2 ? "2nd" : 
                               member.generation === 3 ? "3rd" : 
                               `${member.generation}th`}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.birthDate}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.location || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.occupation || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                            <Button size="sm" variant="ghost">View</Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No members found matching your criteria</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {selectedMemberId && (
        <div className="mt-6">
          <MemberDetail 
            memberId={selectedMemberId}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </motion.div>
  );
}
