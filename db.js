const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchUsers() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error; // Re-throw the error or handle it accordingly
    }
  }
  
  // Call the function
  fetchUsers().then(users => {
    console.log(users); // Handle the fetched users here
  }).catch(error => {
    console.error("Error occurred:", error);
  });