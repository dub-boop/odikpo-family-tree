import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";

interface ControlsProps {
  onFilterChange: (filters: {
    generations: number[];
    branch: string;
    searchTerm?: string;
  }) => void;
}

export default function Controls({ onFilterChange }: ControlsProps) {
  // Initialize with all 13 generations
  const [generations, setGenerations] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  const [branch, setBranch] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/family-members"]
  });
  
  // Debounce search term to avoid excessive rerenders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Update filters when inputs change
  useEffect(() => {
    onFilterChange({
      generations,
      branch,
      searchTerm: debouncedSearchTerm.trim() === "" ? undefined : debouncedSearchTerm
    });
  }, [generations, branch, debouncedSearchTerm, onFilterChange]);
  
  const handleGenerationChange = (generation: number) => {
    setGenerations(prev => {
      if (prev.includes(generation)) {
        return prev.filter(g => g !== generation);
      } else {
        return [...prev, generation];
      }
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow p-4">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold mb-4">Controls</h2>
        
        {/* Search Bar */}
        <div className="mb-6">
          <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Member
          </Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Filter by Generation */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Generation</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {[...Array(13)].map((_, i) => {
                const generation = i + 1;
                return (
                  <div key={generation} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`generation${generation}`} 
                      checked={generations.includes(generation)} 
                      onCheckedChange={() => handleGenerationChange(generation)}
                    />
                    <Label 
                      htmlFor={`generation${generation}`} 
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {generation === 1 ? "First" : 
                       generation === 2 ? "Second" : 
                       generation === 3 ? "Third" : 
                       `${generation}th`} Generation
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Filter by Branch */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Branch</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <RadioGroup
              value={branch}
              onValueChange={setBranch}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-branches" />
                <Label htmlFor="all-branches" className="text-sm text-gray-700 cursor-pointer">
                  All Branches
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nwuchendu" id="nwuchendu" />
                <Label htmlFor="nwuchendu" className="text-sm text-gray-700 cursor-pointer">
                  Nwuchendu Branch
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="osekwe" id="osekwe" />
                <Label htmlFor="osekwe" className="text-sm text-gray-700 cursor-pointer">
                  Osekwe Branch
                </Label>
              </div>
            </RadioGroup>
          )}
        </div>
        
        {/* View Controls */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">View Controls</h3>
          <div className="flex items-center space-x-3 mb-3">
            <Button 
              size="icon"
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800" 
              title="Zoom In"
            >
              <i className="ri-zoom-in-line"></i>
            </Button>
            <Button 
              size="icon"
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800" 
              title="Zoom Out"
            >
              <i className="ri-zoom-out-line"></i>
            </Button>
            <Button 
              size="icon"
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800" 
              title="Reset View"
            >
              <i className="ri-refresh-line"></i>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 flex-1 text-sm" 
              title="Vertical View"
            >
              <i className="ri-layout-column-line mr-1"></i> Vertical
            </Button>
            <Button 
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 flex-1 text-sm" 
              title="Horizontal View"
            >
              <i className="ri-layout-row-line mr-1"></i> Horizontal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
