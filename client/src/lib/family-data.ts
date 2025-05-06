import { FamilyMember, FamilyTreeNode } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  const response = await apiRequest("GET", "/api/family-members", undefined);
  return response.json();
}

export async function fetchFamilyMember(id: number): Promise<FamilyMember> {
  const response = await apiRequest("GET", `/api/family-members/${id}`, undefined);
  return response.json();
}

export async function fetchFamilyMembersByGeneration(generation: number): Promise<FamilyMember[]> {
  const response = await apiRequest(
    "GET",
    `/api/family-members/generation/${generation}`,
    undefined
  );
  return response.json();
}

export async function fetchFamilyMembersByBranch(branch: string): Promise<FamilyMember[]> {
  const response = await apiRequest(
    "GET",
    `/api/family-members/branch/${branch}`,
    undefined
  );
  return response.json();
}

export async function createFamilyMember(
  member: Omit<FamilyMember, "id">
): Promise<FamilyMember> {
  const response = await apiRequest("POST", "/api/family-members", member);
  return response.json();
}

export async function updateFamilyMember(
  id: number,
  member: Partial<Omit<FamilyMember, "id">>
): Promise<FamilyMember> {
  const response = await apiRequest("PUT", `/api/family-members/${id}`, member);
  return response.json();
}

export async function deleteFamilyMember(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/family-members/${id}`, undefined);
}

export interface FilterOptions {
  generations: number[];
  branch: "all" | "paternal" | "maternal";
  searchTerm?: string;
}

export const findMemberById = (
  id: number,
  tree: FamilyTreeNode[]
): FamilyTreeNode | null => {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findMemberById(id, node.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const findRelatives = (
  member: FamilyMember,
  allMembers: FamilyMember[]
): {
  parents: FamilyMember[];
  siblings: FamilyMember[];
  children: FamilyMember[];
} => {
  const parents = member.parentId
    ? allMembers.filter((m) => m.id === member.parentId)
    : [];
  
  const siblings = member.parentId
    ? allMembers.filter(
        (m) => m.parentId === member.parentId && m.id !== member.id
      )
    : [];
  
  const children = allMembers.filter((m) => m.parentId === member.id);

  return { parents, siblings, children };
};

export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  
  const birthYear = parseInt(birthDate);
  if (isNaN(birthYear)) return null;
  
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

export function formatAge(birthDate: string, deathDate?: string): string {
  if (!birthDate) return "Unknown";
  
  const age = calculateAge(birthDate);
  if (age === null) return "Unknown";
  
  if (deathDate) {
    return `${birthDate} - ${deathDate} (${deathDate - birthDate} years)`;
  }
  
  return `${age} years`;
}
