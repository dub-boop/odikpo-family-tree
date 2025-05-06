import { useState } from "react";
import { motion } from "framer-motion";
import Controls from "@/components/Controls";
import FamilyStats from "@/components/FamilyStats";
import FamilyTree from "@/components/FamilyTree";
import MemberDetail from "@/components/MemberDetail";

export default function Home() {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    generations: [1, 2, 3, 4],
    branch: "all",
    searchTerm: undefined
  });

  const handleSelectMember = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  const handleCloseDetail = () => {
    setSelectedMemberId(null);
  };

  const handleFilterChange = (filters: any) => {
    setFilterOptions(filters);
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="lg:flex">
        {/* Left sidebar - Controls */}
        <div className="lg:w-72 mb-6 lg:mb-0 lg:mr-6">
          <Controls onFilterChange={handleFilterChange} />
          <FamilyStats />
        </div>

        {/* Main content area */}
        <div className="lg:flex-1">
          <FamilyTree 
            onSelectMember={handleSelectMember}
            selectedMemberId={selectedMemberId}
            filterOptions={filterOptions}
          />
          
          {selectedMemberId && (
            <MemberDetail 
              memberId={selectedMemberId} 
              onClose={handleCloseDetail} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
