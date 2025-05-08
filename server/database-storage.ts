import { 
    FamilyMember, 
    InsertFamilyMember, 
    familyMembers,
    FamilyTreeNode,
    generateTreeDataFromMembers
  } from "@shared/schema";
  import { db } from "./db";
  import { eq, gte, lte, and, desc, asc } from "drizzle-orm";
  
  import { IStorage } from "./storage";
  
  export class DatabaseStorage implements IStorage {
    async getAllFamilyMembers(): Promise<FamilyMember[]> {
      return await db.select().from(familyMembers).orderBy(asc(familyMembers.id));
    }
  
    async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
      const results = await db
        .select()
        .from(familyMembers)
        .where(eq(familyMembers.id, id));
      
      return results.length > 0 ? results[0] : undefined;
    }
  
    async getFamilyMembersByGeneration(generation: number): Promise<FamilyMember[]> {
      return await db
        .select()
        .from(familyMembers)
        .where(eq(familyMembers.generation, generation))
        .orderBy(asc(familyMembers.id));
    }
  
    async getFamilyMembersByBranch(branch: string): Promise<FamilyMember[]> {
      return await db
        .select()
        .from(familyMembers)
        .where(eq(familyMembers.branch, branch))
        .orderBy(asc(familyMembers.id));
    }
  
    async createFamilyMember(memberData: InsertFamilyMember): Promise<FamilyMember> {
      const results = await db
        .insert(familyMembers)
        .values(memberData)
        .returning() as FamilyMember[];
      
      return results[0];
    }
  
    async updateFamilyMember(
      id: number,
      memberData: InsertFamilyMember
    ): Promise<FamilyMember | undefined> {
      const results = await db
        .update(familyMembers)
        .set(memberData)
        .where(eq(familyMembers.id, id))
        .returning() as FamilyMember[];
      
      return results.length > 0 ? results[0] : undefined;
    }
  
    async deleteFamilyMember(id: number): Promise<boolean> {
      // Find all children of this member to cascade delete them
      const childrenToDelete = await db
        .select()
        .from(familyMembers)
        .where(eq(familyMembers.parentId, id));
      
      // Delete children recursively
      for (const child of childrenToDelete as FamilyMember[]) {
        await this.deleteFamilyMember(child.id);
      }
      
      // Delete the member
      const results = await db
        .delete(familyMembers)
        .where(eq(familyMembers.id, id))
        .returning() as FamilyMember[];
      
      return results.length > 0;
    }
  
    async getFamilyTree(): Promise<FamilyTreeNode[]> {
      const members = await this.getAllFamilyMembers();
      return generateTreeDataFromMembers(members);
    }
    
    async seedInitialData() {
      try {
        // Import from the CSV file using our import function
        const { importCsvData } = await import('./import-csv');
        await importCsvData();
      } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
      }
    }
  }