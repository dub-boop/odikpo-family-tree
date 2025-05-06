import { useState, useRef, useCallback, useEffect } from "react";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { FamilyTreeNode } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import MemberCard from "./MemberCard";
import ExportTreeDialog from "./ExportTreeDialog"; 
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RefreshCw,
  LayoutIcon,
  UsersIcon,
  UserIcon,
  ListIcon,
  FileDownIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

interface FamilyTreeProps {
  onSelectMember: (memberId: number) => void;
  selectedMemberId: number | null;
  filterOptions: {
    generations: number[];
    branch: string;
    searchTerm?: string;
  };
}

const containerStyles = {
  width: "100%",
  height: "100%",
};

// Define color palette for different generations
const generationColors = {
  1: { fill: "#4f46e5", stroke: "#4338ca" }, // Indigo for patriarch/1st gen
  2: { fill: "#3b82f6", stroke: "#2563eb" }, // Blue for 2nd gen
  3: { fill: "#06b6d4", stroke: "#0891b2" }, // Cyan for 3rd gen
  4: { fill: "#10b981", stroke: "#059669" }, // Emerald for 4th gen
  5: { fill: "#84cc16", stroke: "#65a30d" }, // Lime for 5th gen
  6: { fill: "#eab308", stroke: "#ca8a04" }, // Yellow for 6th gen
  7: { fill: "#f97316", stroke: "#ea580c" }, // Orange for 7th gen
  8: { fill: "#ef4444", stroke: "#dc2626" }, // Red for 8th gen
  9: { fill: "#ec4899", stroke: "#db2777" }, // Pink for 9th gen
  10: { fill: "#8b5cf6", stroke: "#7c3aed" }, // Purple for 10th gen
  11: { fill: "#6366f1", stroke: "#4f46e5" }, // Lighter indigo for 11th gen
  12: { fill: "#0ea5e9", stroke: "#0284c7" }, // Sky blue for 12th gen
  13: { fill: "#14b8a6", stroke: "#0d9488" }, // Teal for 13th gen
};

const customNodeMixin = {
  circles: {
    fill: "#3b82f6",
    stroke: "#2563eb",
    strokeWidth: 1,
  },
};

export default function FamilyTree({ 
  onSelectMember, 
  selectedMemberId,
  filterOptions
}: FamilyTreeProps) {
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(0.8);
  const [viewMode, setViewMode] = useState<"family" | "individual" | "timeline">("family");
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  
  const { data: treeData, isLoading, error } = useQuery({
    queryKey: ["/api/family-members"],
    select: (data) => {
      // Filter the data based on filterOptions
      const filtered = data.filter((member: any) => {
        // Filter by generation
        if (filterOptions.generations.length > 0 && !filterOptions.generations.includes(member.generation)) {
          return false;
        }
        
        // Filter by branch
        if (filterOptions.branch !== "all" && member.branch !== filterOptions.branch) {
          return false;
        }
        
        // Filter by search term
        if (filterOptions.searchTerm && !member.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });
      
      // Generate tree structure from filtered data
      const patriarch = filtered.find((member: any) => member.isPatriarch);
      if (!patriarch) return [];
      
      const buildTree = (member: any): FamilyTreeNode => {
        const children = filtered.filter((m: any) => m.parentId === member.id);
        return {
          id: member.id,
          name: member.name,
          attributes: {
            birthDate: member.birthDate || "",
            deathDate: member.deathDate || "",
            generation: member.generation,
            isPatriarch: member.isPatriarch,
            occupation: member.occupation || "",
            location: member.location || "",
            imageUrl: member.imageUrl || "",
          },
          children: children.map((child: any) => buildTree(child)),
        };
      };
      
      return [buildTree(patriarch)];
    }
  });

  // Center the tree when it's loaded or resized
  useEffect(() => {
    if (containerRef.current && treeData) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 8 });
      
      // Adjust zoom level based on the number of nodes to better fit large trees
      const countNodes = (node: any): number => {
        if (!node) return 0;
        let count = 1; // Count this node
        if (node.children && node.children.length) {
          node.children.forEach((child: any) => {
            count += countNodes(child);
          });
        }
        return count;
      };
      
      // If we have tree data, calculate a better zoom level
      if (treeData[0]) {
        const nodeCount = countNodes(treeData[0]);
        // Gradually reduce zoom for larger trees
        const dynamicZoom = Math.max(0.3, Math.min(0.8, 1.2 - (nodeCount / 500)));
        setZoom(dynamicZoom);
      }
    }
  }, [treeData, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.3));
  };

  const handleResetView = () => {
    if (containerRef.current && treeData && treeData[0]) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 8 });
      
      // Recalculate the optimal zoom level
      const countNodes = (node: any): number => {
        if (!node) return 0;
        let count = 1;
        if (node.children && node.children.length) {
          node.children.forEach((child: any) => {
            count += countNodes(child);
          });
        }
        return count;
      };
      
      const nodeCount = countNodes(treeData[0]);
      const dynamicZoom = Math.max(0.3, Math.min(0.8, 1.2 - (nodeCount / 500)));
      setZoom(dynamicZoom);
    }
  };

  const renderCustomNodeElement = useCallback(
    ({ nodeDatum, toggleNode }: any) => {
      // Get generation from node data
      const generation = nodeDatum.attributes.generation || 1;
      
      // Get color for this generation (or fallback to blue if not found)
      const genColor = generationColors[generation as keyof typeof generationColors] || 
        { fill: "#3b82f6", stroke: "#2563eb" };
      
      // Use selected state colors or generation colors
      const fill = nodeDatum.id === selectedMemberId ? 
        genColor.stroke : // Darker version for selected state
        genColor.fill;    // Regular fill color
        
      const stroke = nodeDatum.id === selectedMemberId ?
        genColor.stroke :  // Darker version for border 
        genColor.stroke;
        
      return (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => onSelectMember(nodeDatum.id)}
        >
          {/* Main circle with generation-specific color */}
          <circle
            r={20}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={nodeDatum.id === selectedMemberId ? "5,5" : "0"}
          />
          
          {/* If there's a profile image, show it */}
          {nodeDatum.attributes.imageUrl && (
            <foreignObject width={30} height={30} x={-15} y={-15}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: nodeDatum.id === selectedMemberId ? `2px solid ${stroke}` : "none",
                }}
              >
                <img
                  src={nodeDatum.attributes.imageUrl}
                  alt={nodeDatum.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </foreignObject>
          )}
          
          {/* Generation indicator */}
          <text
            dy={-30}
            fill={nodeDatum.id === selectedMemberId ? stroke : "#4b5563"}
            fontWeight={nodeDatum.id === selectedMemberId ? "bold" : "normal"}
            textAnchor="middle"
            style={{ fontSize: "12px" }}
          >
            {nodeDatum.name}
          </text>
          
          {/* Generation badge */}
          <text 
            dx={25} 
            dy={-20} 
            fill={fill}
            style={{ 
              fontSize: "9px", 
              fontWeight: "bold" 
            }}
          >
            Gen {generation}
          </text>
          
          {/* Birth/death dates */}
          {nodeDatum.attributes.birthDate && (
            <text
              dy={40}
              fill="#6b7280"
              textAnchor="middle"
              style={{ fontSize: "10px" }}
            >
              {`${nodeDatum.attributes.birthDate} ${
                nodeDatum.attributes.deathDate ? `- ${nodeDatum.attributes.deathDate}` : ""
              }`}
            </text>
          )}
        </motion.g>
      );
    },
    [selectedMemberId, onSelectMember]
  );

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="border border-gray-200 rounded-lg h-[500px] w-full flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-4 w-28 mt-4 mx-auto" />
            <Skeleton className="h-24 w-48 mt-8 mx-auto" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white rounded-lg shadow p-4 mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">Failed to load family tree data</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Odikpo Family Tree</h1>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: any) => value && setViewMode(value)}>
          <ToggleGroupItem value="family">
            <UsersIcon className="h-4 w-4 mr-1" />
            Family View
          </ToggleGroupItem>
          <ToggleGroupItem value="individual">
            <UserIcon className="h-4 w-4 mr-1" />
            Individual
          </ToggleGroupItem>
          <ToggleGroupItem value="timeline">
            <ListIcon className="h-4 w-4 mr-1" />
            Timeline
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="relative border border-gray-200 rounded-lg overflow-hidden" 
           ref={containerRef} 
           style={{ height: "calc(100vh - 350px)", minHeight: "500px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            {viewMode === "family" && treeData && treeData.length > 0 && (
              <div ref={treeRef} className="w-full h-full">
                <Tree
                  data={treeData[0]}
                  orientation={orientation === "vertical" ? "vertical" : "horizontal"}
                  translate={translate}
                  zoom={zoom}
                  nodeSize={{ x: 160, y: 160 }} // Smaller nodes to fit more in view
                  renderCustomNodeElement={renderCustomNodeElement}
                  pathFunc="step"
                  separation={{ siblings: 0.8, nonSiblings: 1.2 }}
                  zoomable={true}
                  initialDepth={1}
                  collapsible={true}
                  shouldCollapseNeighborNodes={true}
                  depthFactor={300}
                  styles={{
                    nodes: {
                      node: customNodeMixin,
                    },
                    links: {
                      stroke: "#d1d5db",
                      strokeWidth: 2,
                    },
                  }}
                  pathClassFunc={(data) => {
                    const parentGeneration = data.source.data.attributes.generation || 1;
                    return `link-gen-${parentGeneration}`;
                  }}
              />
              </div>
            )}
            
            {viewMode === "individual" && selectedMemberId && (
              <div className="p-4 h-full flex items-center justify-center">
                <MemberCard
                  memberId={selectedMemberId}
                  isExpanded={true}
                  onClick={() => {}}
                />
              </div>
            )}
            
            {viewMode === "timeline" && (
              <div className="p-4 overflow-auto h-full">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-bold mb-4">Family Timeline</h2>
                  <div className="relative border-l-2 border-gray-200 ml-6">
                    {treeData && treeData[0] && renderTimelineNodes(treeData[0])}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Controls overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2 bg-white/80 p-2 rounded shadow">
          <Button size="icon" variant="ghost" onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleResetView} title="Reset View">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setOrientation(prev => prev === "vertical" ? "horizontal" : "vertical")} 
            title={orientation === "vertical" ? "Switch to Horizontal" : "Switch to Vertical"}
          >
            <LayoutIcon className="h-4 w-4" />
          </Button>
          {viewMode === "family" && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowExportDialog(true)} 
              title="Export Family Tree"
            >
              <FileDownIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Export Dialog */}
        {treeData && treeData.length > 0 && (
          <ExportTreeDialog 
            treeData={treeData[0]} 
            treeRef={treeRef}
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
          />
        )}
      </div>
    </Card>
  );
}

// Helper function to render timeline nodes
function renderTimelineNodes(node: FamilyTreeNode): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  
  // Add current node to timeline
  result.push(
    <motion.div 
      key={node.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 ml-6"
    >
      <div className="absolute -left-6 mt-1.5">
        <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
          {node.attributes.imageUrl ? (
            <img 
              src={node.attributes.imageUrl} 
              alt={node.name} 
              className="h-10 w-10 rounded-full object-cover" 
            />
          ) : (
            <span className="text-white text-sm">{node.name.charAt(0)}</span>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{node.name}</h3>
            <p className="text-sm text-gray-500">
              {node.attributes.birthDate} 
              {node.attributes.deathDate ? ` - ${node.attributes.deathDate}` : ''}
            </p>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Generation {node.attributes.generation}
          </span>
        </div>
        {node.attributes.occupation && (
          <p className="mt-2 text-sm">{node.attributes.occupation} {node.attributes.location ? `• ${node.attributes.location}` : ''}</p>
        )}
      </div>
    </motion.div>
  );
  
  // Recursively add all children
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      result.push(...renderTimelineNodes(child));
    });
  }
  
  return result;
}
