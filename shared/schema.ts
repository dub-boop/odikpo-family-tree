import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: varchar("birth_date", { length: 255 }),
  deathDate: varchar("death_date", { length: 255 }),
  occupation: text("occupation"),
  education: text("education"),
  location: text("location"),
  biography: text("biography"),
  imageUrl: text("image_url"),
  parentId: integer("parent_id").references(() => familyMembers.id),
  generation: integer("generation").notNull(),
  branch: text("branch"),
  isPatriarch: boolean("is_patriarch").default(false),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
});

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export const generateTreeDataFromMembers = (
  members: FamilyMember[]
): FamilyTreeNode[] => {
  // Create a map to store members by ID for faster lookup
  const memberMap = new Map<number, FamilyMember>();
  members.forEach((member) => {
    memberMap.set(member.id, member);
  });

  // Find the patriarch/root node
  const patriarch = members.find((member) => member.isPatriarch);
  if (!patriarch) {
    return [];
  }

  // Build the tree structure recursively
  const buildTree = (member: FamilyMember): FamilyTreeNode => {
    const children = members.filter((m) => m.parentId === member.id);
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
      children: children.map((child) => buildTree(child)),
    };
  };

  return [buildTree(patriarch)];
};

export interface FamilyTreeNode {
  id: number;
  name: string;
  attributes: {
    birthDate: string;
    deathDate: string;
    generation: number;
    isPatriarch: boolean;
    occupation: string;
    location: string;
    imageUrl: string;
  };
  children: FamilyTreeNode[];
}
