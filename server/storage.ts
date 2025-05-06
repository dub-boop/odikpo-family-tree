import { 
    FamilyMember, 
    InsertFamilyMember, 
    familyMembers,
    FamilyTreeNode,
    generateTreeDataFromMembers
  } from "@shared/schema";
  
  export interface IStorage {
    getAllFamilyMembers(): Promise<FamilyMember[]>;
    getFamilyMember(id: number): Promise<FamilyMember | undefined>;
    getFamilyMembersByGeneration(generation: number): Promise<FamilyMember[]>;
    getFamilyMembersByBranch(branch: string): Promise<FamilyMember[]>;
    createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
    updateFamilyMember(id: number, member: InsertFamilyMember): Promise<FamilyMember | undefined>;
    deleteFamilyMember(id: number): Promise<boolean>;
    getFamilyTree(): Promise<FamilyTreeNode[]>;
  }
  
  export class MemStorage implements IStorage {
    private members: Map<number, FamilyMember>;
    private currentId: number;
  
    constructor() {
      this.members = new Map();
      this.currentId = 1;
      this.seedInitialData();
    }
  
    async getAllFamilyMembers(): Promise<FamilyMember[]> {
      return Array.from(this.members.values());
    }
  
    async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
      return this.members.get(id);
    }
  
    async getFamilyMembersByGeneration(generation: number): Promise<FamilyMember[]> {
      return Array.from(this.members.values()).filter(
        (member) => member.generation === generation
      );
    }
  
    async getFamilyMembersByBranch(branch: string): Promise<FamilyMember[]> {
      return Array.from(this.members.values()).filter(
        (member) => member.branch === branch
      );
    }
  
    async createFamilyMember(memberData: InsertFamilyMember): Promise<FamilyMember> {
      const id = this.currentId++;
      const member: FamilyMember = { ...memberData, id };
      this.members.set(id, member);
      return member;
    }
  
    async updateFamilyMember(
      id: number,
      memberData: InsertFamilyMember
    ): Promise<FamilyMember | undefined> {
      const member = this.members.get(id);
      if (!member) {
        return undefined;
      }
  
      const updatedMember: FamilyMember = { ...memberData, id };
      this.members.set(id, updatedMember);
      return updatedMember;
    }
  
    async deleteFamilyMember(id: number): Promise<boolean> {
      const hasDeleted = this.members.delete(id);
      
      // Cascade delete: remove children
      if (hasDeleted) {
        const childrenToDelete = Array.from(this.members.values())
          .filter(member => member.parentId === id);
        
        for (const child of childrenToDelete) {
          await this.deleteFamilyMember(child.id);
        }
      }
      
      return hasDeleted;
    }
  
    async getFamilyTree(): Promise<FamilyTreeNode[]> {
      const members = await this.getAllFamilyMembers();
      return generateTreeDataFromMembers(members);
    }
  
    private seedInitialData() {
      // Populate data from the Odikpo Kindred Table
  
      // Create a function to generate a profile image URL based on gender
      const getProfileImageUrl = (gender: string, id: number) => {
        // Using a deterministic approach to assign profile images
        const maleImages = [
          "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
        ];
        
        const femaleImages = [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
          "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
        ];
        
        if (gender === 'M') {
          return maleImages[id % maleImages.length];
        } else {
          return femaleImages[id % femaleImages.length];
        }
      };
  
      // Add entries in ascending order by ID to ensure proper parent-child relationships
      const familyData = [
        // First Generation - The patriarch
        {
          id: 1,
          name: "Onaga",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 1,
          parentId: null,
          occupation: "Founder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Onaga is the original patriarch of the Odikpo kindred, establishing the family lineage.",
          branch: "paternal",
          isPatriarch: true
        },
        // Second Generation
        {
          id: 2,
          name: "Otuomu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 2,
          parentId: 1, // Onaga
          occupation: "Traditional Leader",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Onaga, continued the family legacy.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 3,
          name: "Okoji",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 2,
          parentId: 1, // Onaga
          occupation: "Traditional Leader",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Second son of Onaga.",
          branch: "paternal",
          isPatriarch: false
        },
        // Third Generation
        {
          id: 4,
          name: "Onobiaru",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 3,
          parentId: 3, // Okoji
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Okoji, grandson of Onaga.",
          branch: "paternal",
          isPatriarch: false
        },
        // Fourth Generation
        {
          id: 5,
          name: "Okpalo",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 4,
          parentId: 4, // Onobiaru
          occupation: "Community Leader",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Onobiaru in the fourth generation of the Odikpo kindred.",
          branch: "paternal",
          isPatriarch: false
        },
        // Fifth Generation
        {
          id: 6,
          name: "Odikpo",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 5,
          parentId: 5, // Okpalo
          occupation: "Tribal Leader",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Okpalo and namesake of the Odikpo kindred.",
          branch: "paternal",
          isPatriarch: false
        },
        // Sixth Generation
        {
          id: 7,
          name: "Nwuchendu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 6,
          parentId: 6, // Odikpo
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "First son of Odikpo.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 8,
          name: "Osekwe",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 6,
          parentId: 6, // Odikpo
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Second son of Odikpo.",
          branch: "paternal",
          isPatriarch: false
        },
        // Seventh Generation - Children of Nwuchendu
        {
          id: 9,
          name: "Chiedozie",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 7, // Nwuchendu
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Nwuchendu.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 10,
          name: "Udenabo",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 7, // Nwuchendu
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Second son of Nwuchendu.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 11,
          name: "Ikejiofor",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 7, // Nwuchendu
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Third son of Nwuchendu.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 12,
          name: "Onyejekwe",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 7, // Nwuchendu
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Fourth son of Nwuchendu.",
          branch: "paternal",
          isPatriarch: false
        },
        // Seventh Generation - Children of Osekwe
        {
          id: 13,
          name: "Nwosu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 8, // Osekwe
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Osekwe.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 14,
          name: "Akabogu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 8, // Osekwe
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Second son of Osekwe.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 15,
          name: "Nwunachukwu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 8, // Osekwe
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Third son of Osekwe.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 16,
          name: "Nwezenagu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 7,
          parentId: 8, // Osekwe
          occupation: "Elder",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Fourth son of Osekwe.",
          branch: "paternal",
          isPatriarch: false
        }
      ];
      
      // Adding more family members up to the 8th generation would make this too long
      // We'll add a sampling of 8th generation members to show the structure
      
      const eighthGeneration = [
        {
          id: 17,
          name: "Nwuba",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 8,
          parentId: 9, // Chiedozie
          occupation: "Community Member",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Chiedozie.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 18,
          name: "Anadebe",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 8,
          parentId: 10, // Udenabo
          occupation: "Community Member",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Udenabo.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 19,
          name: "Molokwu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 8,
          parentId: 11, // Ikejiofor
          occupation: "Community Member",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Son of Ikejiofor.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 20,
          name: "Ifejika",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 8,
          parentId: 11, // Ikejiofor
          occupation: "Community Member",
          education: "Traditional Education",
          location: "Eastern Nigeria",
          biography: "Second son of Ikejiofor.",
          branch: "paternal",
          isPatriarch: false
        }
      ];
      
      // Add 9th generation examples
      const ninthGeneration = [
        {
          id: 38,
          name: "Nwobu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 9,
          parentId: 17, // Nwuba
          occupation: "Modern Profession",
          education: "Formal Education",
          location: "Nigeria",
          biography: "Son of Nwuba, representing the ninth generation.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 39,
          name: "Nwonu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 9,
          parentId: 17, // Nwuba
          occupation: "Modern Profession",
          education: "Formal Education",
          location: "Nigeria",
          biography: "Second son of Nwuba.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 40,
          name: "Gbufor",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 9,
          parentId: 18, // Anadebe
          occupation: "Modern Profession",
          education: "Formal Education",
          location: "Nigeria",
          biography: "Son of Anadebe in the ninth generation.",
          branch: "paternal",
          isPatriarch: false
        }
      ];
      
      // Add 10th generation examples
      const tenthGeneration = [
        {
          id: 94,
          name: "Nwachukwu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 10,
          parentId: 38, // Nwobu
          occupation: "Contemporary Profession",
          education: "Higher Education",
          location: "Nigeria",
          biography: "Son of Nwobu, representing the tenth generation.",
          branch: "paternal",
          isPatriarch: false
        },
        {
          id: 95,
          name: "Nwajagu",
          birthDate: "",
          deathDate: "",
          gender: "M",
          generation: 10,
          parentId: 38, // Nwobu
          occupation: "Contemporary Profession",
          education: "Higher Education",
          location: "Nigeria",
          biography: "Second son of Nwobu.",
          branch: "paternal",
          isPatriarch: false
        }
      ];
      
      // Combine all generations
      const allMembers = [
        ...familyData,
        ...eighthGeneration,
        ...ninthGeneration,
        ...tenthGeneration
      ];
      
      // Add all members to the storage with images
      allMembers.forEach(member => {
        const memberWithImage = {
          ...member,
          imageUrl: getProfileImageUrl(member.gender, member.id)
        };
        this.members.set(member.id, memberWithImage);
        
        // Update currentId to be higher than the highest id used
        if (member.id >= this.currentId) {
          this.currentId = member.id + 1;
        }
      });
    }
  }
  
  // Import the new DatabaseStorage class
  import { DatabaseStorage } from "./database-storage";
  
  // Use DatabaseStorage instead of MemStorage
  export const storage = new DatabaseStorage();
  