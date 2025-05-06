import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { db } from './db';
import { familyMembers } from '@shared/schema';

async function importCsvData() {
  try {
    // Check if we already have data in the database
    const existingMembers = await db.select().from(familyMembers).limit(1);
    
    if (existingMembers.length > 0) {
      console.log("Database already has data, clearing existing data before import...");
      // Clear existing data
      await db.delete(familyMembers);
    }
    
    console.log("Importing data from CSV file...");
    
    // Read CSV file
    const csvFilePath = path.resolve('./attached_assets/ODIKPO KINDRED TABLE.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
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
    
    // Process records and prepare for database insertion
    const familyData = records.map((record: any) => {
      const id = parseInt(record.ID, 10);
      const parentId = record['Father ID'] ? parseInt(record['Father ID'], 10) : null;
      const generation = parseInt(record.Generation, 10);
      
      return {
        id,
        name: record.Name,
        birthDate: record['Birth Year'] || "",
        deathDate: record['Death Year'] || "",
        gender: record.Gender,
        generation,
        parentId,
        occupation: "Traditional Leader",
        education: generation > 10 ? "Formal Education" : "Traditional Education",
        location: "Eastern Nigeria",
        biography: `${record.Name} is a member of the Odikpo kindred in generation ${generation}.`,
        branch: record['Father Name'] === 'Nwuchendu' || 
               record['Grandfather Name'] === 'Nwuchendu' || 
               record['Great-grandfather Name'] === 'Nwuchendu' || 
               record['2x Great-grandfather Name'] === 'Nwuchendu' ||
               record['3x Great-grandfather Name'] === 'Nwuchendu' ||
               record['4x Great-grandfather Name'] === 'Nwuchendu' ? 'nwuchendu' :
               record['Father Name'] === 'Osekwe' || 
               record['Grandfather Name'] === 'Osekwe' || 
               record['Great-grandfather Name'] === 'Osekwe' || 
               record['2x Great-grandfather Name'] === 'Osekwe' ||
               record['3x Great-grandfather Name'] === 'Osekwe' ||
               record['4x Great-grandfather Name'] === 'Osekwe' ? 'osekwe' : 
               // ID 7 is Nwuchendu and ID 8 is Osekwe
               id === 7 ? 'nwuchendu' : 
               id === 8 ? 'osekwe' : 'all', // Default branch
        isPatriarch: id === 1, // Only Onaga is the patriarch
        imageUrl: getProfileImageUrl(record.Gender, id)
      };
    });
    
    // Insert in batches to avoid potential transaction limits
    const batchSize = 50;
    for (let i = 0; i < familyData.length; i += batchSize) {
      const batch = familyData.slice(i, i + batchSize);
      await db.insert(familyMembers).values(batch);
      console.log(`Inserted ${i + batch.length} of ${familyData.length} members`);
    }
    
    console.log(`Successfully imported ${familyData.length} family members from CSV`);
  } catch (error) {
    console.error("Error importing CSV data:", error);
    throw error;
  }
}

export { importCsvData };