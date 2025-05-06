import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/family-members"]
  });
  
  const filteredMembers = members?.filter(member => {
    if (selectedGeneration !== null && member.generation !== selectedGeneration) {
      return false;
    }
    return true;
  });
  
  const generations = members ? [...new Set(members.map(m => m.generation))].sort() : [];
  
  // Group photos by decades (simulated here with birth years)
  const photosByDecade = !isLoading && members ? groupPhotosByDecade(members) : {};
  
  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const handleCloseImage = () => {
    setSelectedImage(null);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">Family Gallery</h1>
            
            <div className="flex space-x-2 overflow-auto pb-2 sm:pb-0">
              <Button
                variant={selectedGeneration === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGeneration(null)}
              >
                All Photos
              </Button>
              
              {generations.map(gen => (
                <Button
                  key={gen}
                  variant={selectedGeneration === gen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGeneration(gen)}
                >
                  {gen === 1 ? "1st" : 
                   gen === 2 ? "2nd" : 
                   gen === 3 ? "3rd" : 
                   `${gen}th`} Generation
                </Button>
              ))}
            </div>
          </div>
          
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="members">Member Photos</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="events">Family Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : filteredMembers && filteredMembers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMembers
                    .filter(member => member.imageUrl)
                    .map(member => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative cursor-pointer rounded-md overflow-hidden group"
                        onClick={() => handleOpenImage(member.imageUrl!)}
                      >
                        <img 
                          src={member.imageUrl!} 
                          alt={member.name} 
                          className="w-full h-full object-cover aspect-square" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
                          <div className="p-2 w-full bg-black bg-opacity-60 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs opacity-80">{member.birthDate}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No photos found for this generation</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline">
              <ScrollArea className="h-[600px] pr-4">
                {isLoading ? (
                  <div className="space-y-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {[...Array(4)].map((_, j) => (
                            <Skeleton key={j} className="aspect-square rounded-md" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : Object.keys(photosByDecade).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(photosByDecade)
                      .sort(([decadeA], [decadeB]) => decadeB.localeCompare(decadeA))
                      .map(([decade, photos]) => (
                        <div key={decade}>
                          <h2 className="text-xl font-semibold mb-4">{decade}</h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {photos.map((photo, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer rounded-md overflow-hidden group"
                                onClick={() => handleOpenImage(photo.imageUrl)}
                              >
                                <img 
                                  src={photo.imageUrl} 
                                  alt={photo.caption} 
                                  className="w-full h-full object-cover aspect-square" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
                                  <div className="p-2 w-full bg-black bg-opacity-60 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-sm font-medium truncate">{photo.caption}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No timeline photos available</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="events">
              <div className="text-center py-12">
                <p className="text-gray-500">Family event photos coming soon</p>
                <Button variant="outline" className="mt-4">Upload Event Photos</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedImage} onOpenChange={handleCloseImage}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black bg-opacity-90">
          <DialogHeader className="absolute top-0 right-0 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCloseImage}
              className="text-white hover:bg-black/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>
          
          <div className="relative h-[80vh] flex items-center justify-center">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                className="max-h-full max-w-full object-contain" 
              />
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-2 text-white hover:bg-black/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                // Previous image logic would go here
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 text-white hover:bg-black/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                // Next image logic would go here
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Utility function to group photos by decade
function groupPhotosByDecade(members: any[]) {
  const decades: Record<string, { imageUrl: string; caption: string }[]> = {};
  
  // Get birth decades
  members.forEach(member => {
    if (member.imageUrl && member.birthDate) {
      const year = parseInt(member.birthDate);
      if (!isNaN(year)) {
        const decade = `${Math.floor(year / 10) * 10}s`;
        if (!decades[decade]) {
          decades[decade] = [];
        }
        decades[decade].push({
          imageUrl: member.imageUrl,
          caption: `${member.name} (${member.birthDate})`
        });
      }
    }
  });
  
  return decades;
}
