import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineBody } from "@/components/ui/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyMember } from "@shared/schema";

export default function History() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/family-members"]
  });

  // Process members to create a chronological history
  const timelineEvents = !isLoading && Array.isArray(members) ? 
    processTimelineEvents(members) : 
    [];

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Odikpo Family History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="ml-4 space-y-2 flex-grow">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Timeline>
              {timelineEvents.map((event, index) => (
                <TimelineItem key={index}>
                  {index < timelineEvents.length - 1 && <TimelineConnector />}
                  <TimelineHeader>
                    <TimelineIcon className={event.iconClass} />
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <h3 className="text-base font-medium">{event.title}</h3>
                        <time className="text-sm text-muted-foreground">{event.year}</time>
                      </div>
                      {event.badge && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {event.badge}
                        </span>
                      )}
                    </div>
                  </TimelineHeader>
                  <TimelineBody className="mt-2">
                    <p className="text-muted-foreground">{event.description}</p>
                    {event.members && event.members.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1">
                        {event.members.map((member, i) => (
                          <div key={i} className="relative group">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-white -ml-1 first:ml-0">
                              {member.imageUrl ? (
                                <img 
                                  src={member.imageUrl} 
                                  alt={member.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-xs text-gray-600">{member.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                              {member.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TimelineBody>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to process timeline events from member data
function processTimelineEvents(members: FamilyMember[]) {
  const events = [
    {
      title: "Odikpo Kindred Begins",
      year: "Ancient Times",
      description: "The patriarch of the Odikpo kindred, Onaga, established the family lineage in Eastern Nigeria, founding what would become a large family with many generations.",
      iconClass: "text-primary",
      badge: "Founding",
      members: members.filter(m => m.generation === 1)
    },
    {
      title: "Second Generation",
      year: "Historical Era",
      description: "The second generation of the Odikpo kindred included Otuomu and Okoji, sons of Onaga, who continued the family legacy in Eastern Nigeria.",
      iconClass: "text-blue-500",
      badge: "2nd Generation",
      members: members.filter(m => m.generation === 2)
    },
    {
      title: "Growth of the Kindred",
      year: "Historical Era",
      description: "Generations 3-5 saw the expansion of the family under Onobiaru, Okpalo, and Odikpo himself, for whom the kindred is named.",
      iconClass: "text-green-500",
      badge: "Family Namesake",
      members: members.filter(m => m.generation >= 3 && m.generation <= 5)
    },
    {
      title: "Family Branches Form",
      year: "Recent Centuries",
      description: "The sixth and seventh generations saw the formation of key family branches under Nwuchendu, Osekwe, and their children.",
      iconClass: "text-yellow-500",
      badge: "Family Branches",
      members: members.filter(m => m.generation === 6 || m.generation === 7)
    },
    {
      title: "Expansion of the Kindred",
      year: "Modern Era",
      description: "The eighth and ninth generations saw significant growth with numerous descendants spreading across Nigeria.",
      iconClass: "text-purple-500",
      badge: "Expansion Era",
      members: members.filter(m => m.generation === 8 || m.generation === 9)
    },
    {
      title: "Modern Descendants",
      year: "Contemporary Times",
      description: "The tenth generation represents the modern descendants of the Odikpo kindred, carrying on the family legacy into contemporary times.",
      iconClass: "text-pink-500",
      badge: "10th Generation",
      members: members.filter(m => m.generation === 10)
    }
  ];
  
  return events;
}
