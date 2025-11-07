const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// Middleware
app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json());

// TASK 1: DATABASE & COLLECTION SETUP


// MongoDB Connection String - supports both local and Atlas
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentDB";
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(function(){
  console.log("Connected to MongoDB - studentDB database");
  console.log("Environment:", process.env.NODE_ENV || 'development');
  
  // Start server only after DB connection (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log('📚 MongoDB Practice Task - studentDB');
      console.log(`🔗 Visit http://localhost:${PORT} for API documentation`);
    });
  }
  
}).catch(function(err){
  console.log("Error connecting to MongoDB", err);
});

// Student Schema & Model
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  course: { type: String, required: true },
  status: { type: String, default: 'enrolled' }, // enrolled, completed, dropped
  enrollmentDate: { type: Date, default: Date.now },
  email: String,
  phone: String
});

const Student = mongoose.model("Student", studentSchema);

// Library Schema for Use Case
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  category: String,
  available: { type: Boolean, default: true },
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  borrowDate: Date,
  dueDate: Date
});

const Book = mongoose.model("Book", bookSchema);


// API DOCUMENTATION ROUTE

app.get('/', (req, res) => {
  res.json({
    message: "📚 MongoDB Practice Task API",
    database: "studentDB",
    collections: ["students", "books"],
    endpoints: {
      "CRUD Operations": {
        "GET /students": "Fetch all students",
        "GET /students/filter": "Filter students by course",
        "POST /students/single": "Insert one student",
        "POST /students/multiple": "Insert multiple students",
        "PUT /students/:id": "Update single student",
        "PUT /students/bulk": "Update multiple students",
        "DELETE /students/:id": "Delete single student",
        "DELETE /students/all": "Delete all students"
      },
      "Query Operators": {
        "GET /students/age-range": "Students by age range ($gt, $lt)",
        "GET /students/courses": "Students by multiple courses ($in)",
        "GET /students/complex": "Complex queries ($and, $or, $exists)"
      },
      "Library System": {
        "GET /library/books": "All books",
        "POST /library/books": "Add new book",
        "POST /library/borrow": "Borrow book",
        "POST /library/return": "Return book",
        "GET /library/available": "Available books"
      }
    }
  });
});


// TASK 2: INSERT OPERATIONS


// Insert single student
app.post('/students/single', async (req, res) => {
  try {
    const student = new Student(req.body);
    const result = await student.save();
    res.status(201).json({
      success: true,
      message: "Student inserted successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error inserting student",
      error: error.message
    });
  }
});

// Insert multiple students
app.post('/students/multiple', async (req, res) => {
  try {
    const students = req.body; // Expecting array of student objects
    const result = await Student.insertMany(students);
    res.status(201).json({
      success: true,
      message: `${result.length} students inserted successfully`,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error inserting students",
      error: error.message
    });
  }
});

// Sample data endpoint to populate database
app.post('/students/sample-data', async (req, res) => {
  try {
    const sampleStudents = [
      { name: "John Doe", age: 22, course: "MERN Stack", email: "john@email.com", phone: "123-456-7890" },
      { name: "Jane Smith", age: 24, course: "Python Development", email: "jane@email.com", phone: "123-456-7891" },
      { name: "Mike Johnson", age: 23, course: "MERN Stack", email: "mike@email.com", phone: "123-456-7892" },
      { name: "Sarah Wilson", age: 25, course: "Data Science", email: "sarah@email.com", phone: "123-456-7893" },
      { name: "Alex Brown", age: 21, course: "MERN Stack", status: "completed", email: "alex@email.com", phone: "123-456-7894" }
    ];
    
    const result = await Student.insertMany(sampleStudents);
    res.status(201).json({
      success: true,
      message: "Sample data inserted successfully",
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error inserting sample data",
      error: error.message
    });
  }
});

// TASK 3: READ OPERATIONS


// Fetch all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message
    });
  }
});

// Fetch students by course filter
app.get('/students/filter', async (req, res) => {
  try {
    const { course } = req.query;
    const filter = course ? { course: course } : {};
    const students = await Student.find(filter);
    
    res.json({
      success: true,
      filter: filter,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filtered students",
      error: error.message
    });
  }
});

// Fetch students enrolled in MERN Stack
app.get('/students/mern-stack', async (req, res) => {
  try {
    const students = await Student.find({ course: "MERN Stack" });
    res.json({
      success: true,
      message: "Students enrolled in MERN Stack",
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching MERN Stack students",
      error: error.message
    });
  }
});

// TASK 4: UPDATE OPERATIONS


// Update single student by ID
app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const student = await Student.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    res.json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating student",
      error: error.message
    });
  }
});

// Update student status to completed
app.put('/students/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    res.json({
      success: true,
      message: "Student status updated to completed",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating student status",
      error: error.message
    });
  }
});

// Update multiple students (bulk update)
app.put('/students/bulk', async (req, res) => {
  try {
    const { filter, update } = req.body;
    
    const result = await Student.updateMany(filter, update);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} students updated successfully`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating students",
      error: error.message
    });
  }
});


// TASK 5: DELETE OPERATIONS


// Delete single student by ID
app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndDelete(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    res.json({
      success: true,
      message: "Student deleted successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting student",
      error: error.message
    });
  }
});

// Delete student by condition (e.g., status = "dropped")
app.delete('/students/by-condition', async (req, res) => {
  try {
    const { condition } = req.body;
    
    const result = await Student.deleteOne(condition);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No student found matching the condition"
      });
    }
    
    res.json({
      success: true,
      message: "Student deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting student",
      error: error.message
    });
  }
});

// Delete all students (for practice only - use with caution!)
app.delete('/students/all', async (req, res) => {
  try {
    const result = await Student.deleteMany({});
    
    res.json({
      success: true,
      message: "All students deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting all students",
      error: error.message
    });
  }
});


// TASK 6: QUERY OPERATORS


// $gt and $lt - Students by age range
app.get('/students/age-range', async (req, res) => {
  try {
    const { minAge = 0, maxAge = 100 } = req.query;
    
    const students = await Student.find({
      age: { 
        $gt: parseInt(minAge), 
        $lt: parseInt(maxAge) 
      }
    });
    
    res.json({
      success: true,
      message: `Students aged between ${minAge} and ${maxAge}`,
      filter: { age: { $gt: parseInt(minAge), $lt: parseInt(maxAge) } },
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students by age range",
      error: error.message
    });
  }
});

// $in - Students enrolled in multiple courses
app.get('/students/courses', async (req, res) => {
  try {
    const { courses } = req.query; // Expected: "MERN Stack,Python Development"
    const courseArray = courses ? courses.split(',') : ["MERN Stack", "Python Development"];
    
    const students = await Student.find({
      course: { $in: courseArray }
    });
    
    res.json({
      success: true,
      message: `Students enrolled in specified courses`,
      filter: { course: { $in: courseArray } },
      courses: courseArray,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students by courses",
      error: error.message
    });
  }
});

// $and, $or, $exists - Complex queries
app.get('/students/complex', async (req, res) => {
  try {
    const { queryType = 'and' } = req.query;
    
    let query;
    let description;
    
    switch(queryType) {
      case 'and':
        // Students aged 22-25 AND enrolled in MERN Stack
        query = {
          $and: [
            { age: { $gte: 22, $lte: 25 } },
            { course: "MERN Stack" }
          ]
        };
        description = "Students aged 22-25 AND enrolled in MERN Stack";
        break;
        
      case 'or':
        // Students either completed OR aged above 24
        query = {
          $or: [
            { status: "completed" },
            { age: { $gt: 24 } }
          ]
        };
        description = "Students either completed OR aged above 24";
        break;
        
      case 'exists':
        // Students who have email field
        query = {
          email: { $exists: true, $ne: "" }
        };
        description = "Students who have email field";
        break;
        
      default:
        query = {};
        description = "All students";
    }
    
    const students = await Student.find(query);
    
    res.json({
      success: true,
      message: description,
      queryType: queryType,
      filter: query,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error executing complex query",
      error: error.message
    });
  }
});

// Combined operators example
app.get('/students/advanced-search', async (req, res) => {
  try {
    // Students aged 20-25, enrolled in specific courses, and have email
    const students = await Student.find({
      $and: [
        { 
          age: { $gte: 20, $lte: 25 }
        },
        { 
          course: { $in: ["MERN Stack", "Python Development", "Data Science"] }
        },
        { 
          email: { $exists: true }
        },
        {
          $or: [
            { status: "enrolled" },
            { status: "completed" }
          ]
        }
      ]
    });
    
    res.json({
      success: true,
      message: "Advanced search with multiple operators",
      criteria: "Age 20-25, specific courses, has email, enrolled or completed",
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error executing advanced search",
      error: error.message
    });
  }
});


// TASK 7: LIBRARY SYSTEM USE CASE


// Get all books
app.get('/library/books', async (req, res) => {
  try {
    const books = await Book.find().populate('borrowedBy', 'name email');
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message
    });
  }
});

// Add new book to library
app.post('/library/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    const result = await book.save();
    res.status(201).json({
      success: true,
      message: "Book added to library successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding book",
      error: error.message
    });
  }
});

// Get available books
app.get('/library/available', async (req, res) => {
  try {
    const availableBooks = await Book.find({ available: true });
    res.json({
      success: true,
      message: "Available books",
      count: availableBooks.length,
      data: availableBooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching available books",
      error: error.message
    });
  }
});

// Borrow a book
app.post('/library/borrow', async (req, res) => {
  try {
    const { bookId, studentId } = req.body;
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }
    
    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is already borrowed"
      });
    }
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    // Update book
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        available: false,
        borrowedBy: studentId,
        borrowDate: new Date(),
        dueDate: dueDate
      },
      { new: true }
    ).populate('borrowedBy', 'name email');
    
    res.json({
      success: true,
      message: "Book borrowed successfully",
      data: updatedBook
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error borrowing book",
      error: error.message
    });
  }
});

// Return a book
app.post('/library/return', async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }
    
    if (book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is not currently borrowed"
      });
    }
    
    // Update book
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        available: true,
        borrowedBy: null,
        borrowDate: null,
        dueDate: null
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: "Book returned successfully",
      data: updatedBook
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error returning book",
      error: error.message
    });
  }
});

// Get books by category
app.get('/library/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const books = await Book.find({ 
      category: { $regex: category, $options: 'i' } 
    }).populate('borrowedBy', 'name email');
    
    res.json({
      success: true,
      category: category,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching books by category",
      error: error.message
    });
  }
});

// Add sample library data
app.post('/library/sample-data', async (req, res) => {
  try {
    const sampleBooks = [
      {
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        isbn: "978-0596517748",
        category: "Programming"
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        category: "Programming"
      },
      {
        title: "The Pragmatic Programmer",
        author: "David Thomas, Andrew Hunt",
        isbn: "978-0201616224",
        category: "Programming"
      },
      {
        title: "Python Crash Course",
        author: "Eric Matthes",
        isbn: "978-1593276034",
        category: "Programming"
      },
      {
        title: "Data Science from Scratch",
        author: "Joel Grus",
        isbn: "978-1492041139",
        category: "Data Science"
      }
    ];
    
    const result = await Book.insertMany(sampleBooks);
    res.status(201).json({
      success: true,
      message: "Sample library data inserted successfully",
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error inserting sample library data",
      error: error.message
    });
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
    database: "studentDB"
  });
});

// Database stats
app.get('/stats', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const bookCount = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ available: true });
    const borrowedBooks = await Book.countDocuments({ available: false });
    
    res.json({
      success: true,
      database: "studentDB",
      collections: {
        students: {
          total: studentCount,
          byStatus: {
            enrolled: await Student.countDocuments({ status: "enrolled" }),
            completed: await Student.countDocuments({ status: "completed" }),
            dropped: await Student.countDocuments({ status: "dropped" })
          }
        },
        books: {
          total: bookCount,
          available: availableBooks,
          borrowed: borrowedBooks
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching database stats",
      error: error.message
    });
  }
});

// Export the Express app for Vercel
module.exports = app;