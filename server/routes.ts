import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFamilyMemberSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all family members
  app.get("/api/family-members", async (req, res) => {
    try {
      const members = await storage.getAllFamilyMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  // Get a single family member by ID
  app.get("/api/family-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const member = await storage.getFamilyMember(id);
      if (!member) {
        return res.status(404).json({ message: "Family member not found" });
      }

      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family member" });
    }
  });

  // Get family members by generation
  app.get("/api/family-members/generation/:generation", async (req, res) => {
    try {
      const generation = parseInt(req.params.generation);
      if (isNaN(generation)) {
        return res.status(400).json({ message: "Invalid generation format" });
      }

      const members = await storage.getFamilyMembersByGeneration(generation);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members by generation" });
    }
  });

  // Get family members by branch
  app.get("/api/family-members/branch/:branch", async (req, res) => {
    try {
      const branch = req.params.branch;
      const members = await storage.getFamilyMembersByBranch(branch);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members by branch" });
    }
  });

  // Create a new family member
  app.post("/api/family-members", async (req, res) => {
    try {
      const memberData = insertFamilyMemberSchema.parse(req.body);
      const newMember = await storage.createFamilyMember(memberData);
      res.status(201).json(newMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create family member" });
    }
  });

  // Update an existing family member
  app.put("/api/family-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const memberData = insertFamilyMemberSchema.parse(req.body);
      const updatedMember = await storage.updateFamilyMember(id, memberData);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Family member not found" });
      }

      res.json(updatedMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update family member" });
    }
  });

  // Delete a family member
  app.delete("/api/family-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteFamilyMember(id);
      if (!success) {
        return res.status(404).json({ message: "Family member not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete family member" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
