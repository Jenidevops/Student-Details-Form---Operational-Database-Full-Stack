# 🔍 How to Check MongoDB Data - Complete Guide

## ✅ Your Current Database Status:
- **Database Name:** studentDB
- **Collection:** students
- **Total Students:** 32 students stored
- **Status Breakdown:**
  - Enrolled: 6 students
  - In Progress: 18 students
  - Completed: 8 students

---

## 📊 Method 1: MongoDB Shell Commands (mongosh)

### Basic Commands:

#### 1. **Connect to MongoDB:**
```bash
mongosh
```

#### 2. **Switch to Your Database:**
```bash
use studentDB
```

#### 3. **View All Students:**
```bash
db.students.find().pretty()
```

#### 4. **Count Total Students:**
```bash
db.students.countDocuments()
```

#### 5. **View Latest 5 Students:**
```bash
db.students.find().sort({_id: -1}).limit(5).pretty()
```

#### 6. **Find Students by Status:**
```bash
# Enrolled students
db.students.find({status: "enrolled"}).pretty()

# In Progress students
db.students.find({status: "in-progress"}).pretty()

# Completed students
db.students.find({status: "completed"}).pretty()
```

#### 7. **Find Student by Name:**
```bash
db.students.find({name: "Alice Johnson"}).pretty()
```

#### 8. **Find Students by Course:**
```bash
db.students.find({course: "MERN Stack"}).pretty()
```

#### 9. **Count Students by Course:**
```bash
db.students.aggregate([
  { $group: { _id: "$course", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

#### 10. **View Most Recent Student Added:**
```bash
db.students.find().sort({_id: -1}).limit(1).pretty()
```

---

## 🖥️ Method 2: Using Your Backend API

### View in Browser:

#### 1. **All Students:**
```
http://localhost:3000/students
```

#### 2. **Database Statistics:**
```
http://localhost:3000/stats
```

#### 3. **Filter by Course:**
```
http://localhost:3000/students/filter?course=MERN Stack
```

#### 4. **Students by Age Range:**
```
http://localhost:3000/students/age-range?minAge=20&maxAge=25
```

#### 5. **API Documentation:**
```
http://localhost:3000
```

---

## 🎨 Method 3: MongoDB Compass (GUI)

### Steps:

1. **Download & Install:**
   ```
   https://www.mongodb.com/try/download/compass
   ```

2. **Connect:**
   - Connection String: `mongodb://127.0.0.1:27017`
   - Click "Connect"

3. **Navigate:**
   - Left sidebar → Select "studentDB"
   - Click "students" collection
   - View all your data visually!

4. **Features:**
   - ✅ Visual data browsing
   - ✅ Add/Edit/Delete records
   - ✅ Run queries
   - ✅ See statistics
   - ✅ Export data

---

## 🔍 Quick One-Line Commands

### From Terminal (Outside MongoDB Shell):

#### View all students:
```bash
mongosh studentDB --eval "db.students.find().pretty()"
```

#### Count students:
```bash
mongosh studentDB --eval "db.students.countDocuments()"
```

#### Latest student:
```bash
mongosh studentDB --eval "db.students.find().sort({_id: -1}).limit(1).pretty()"
```

#### Students by status:
```bash
mongosh studentDB --eval "db.students.find({status: 'in-progress'}).pretty()"
```

#### Delete all students (CAREFUL!):
```bash
mongosh studentDB --eval "db.students.deleteMany({})"
```

---

## 📊 Useful Queries for Your App

### 1. **Check if Updates Are Working:**
```bash
# Before update: Note student's age
mongosh studentDB --eval "db.students.findOne({name: 'Alice Johnson'})"

# Update via your app (change age)

# After update: Verify change
mongosh studentDB --eval "db.students.findOne({name: 'Alice Johnson'})"
```

### 2. **Verify Status Changes:**
```bash
# Count before changing status
mongosh studentDB --eval "db.students.countDocuments({status: 'completed'})"

# Change some students to completed via your app

# Count after
mongosh studentDB --eval "db.students.countDocuments({status: 'completed'})"
```

### 3. **Check Email and Phone Fields:**
```bash
mongosh studentDB --eval "db.students.find({email: {\$exists: true, \$ne: ''}}).count()"
```

### 4. **Find Duplicate Names:**
```bash
mongosh studentDB --eval "
  db.students.aggregate([
    { \$group: { _id: '\$name', count: { \$sum: 1 } } },
    { \$match: { count: { \$gt: 1 } } }
  ])
"
```

---

## 🎯 Verify CRUD Operations

### Test Each Operation:

#### 1. **CREATE (Add):**
```bash
# Add via your app, then check:
mongosh studentDB --eval "db.students.find().sort({_id: -1}).limit(1).pretty()"
```

#### 2. **READ (View):**
```bash
# View all:
mongosh studentDB --eval "db.students.find().pretty()"
```

#### 3. **UPDATE (Edit):**
```bash
# Before update:
mongosh studentDB --eval "db.students.findOne({name: 'Test User'})"

# Update via app

# After update:
mongosh studentDB --eval "db.students.findOne({name: 'Test User'})"
```

#### 4. **DELETE (Remove):**
```bash
# Count before:
mongosh studentDB --eval "db.students.countDocuments()"

# Delete via app

# Count after:
mongosh studentDB --eval "db.students.countDocuments()"
```

---

## 📈 Advanced Queries

### 1. **Students Grouped by Course:**
```javascript
db.students.aggregate([
  { $group: { 
      _id: "$course", 
      count: { $sum: 1 },
      avgAge: { $avg: "$age" }
  }},
  { $sort: { count: -1 } }
])
```

### 2. **Students by Status and Course:**
```javascript
db.students.aggregate([
  { $group: { 
      _id: { course: "$course", status: "$status" },
      count: { $sum: 1 }
  }}
])
```

### 3. **Find Students Without Email:**
```javascript
db.students.find({ 
  $or: [
    { email: { $exists: false } },
    { email: "" }
  ]
})
```

---

## 🚀 Quick Verification Script

Save this as `check-db.sh`:

```bash
#!/bin/bash

echo "======================================"
echo "📊 MongoDB studentDB Statistics"
echo "======================================"
echo ""

mongosh studentDB --quiet --eval "
  print('Total Students:', db.students.countDocuments());
  print('');
  print('By Status:');
  print('  - Enrolled:', db.students.countDocuments({status: 'enrolled'}));
  print('  - In Progress:', db.students.countDocuments({status: {\$regex: /progress/i}}));
  print('  - Completed:', db.students.countDocuments({status: 'completed'}));
  print('');
  print('By Course:');
  db.students.aggregate([
    { \$group: { _id: '\$course', count: { \$sum: 1 } } },
    { \$sort: { count: -1 } }
  ]).forEach(doc => print('  -', doc._id + ':', doc.count));
  print('');
  print('Latest 3 Students:');
  db.students.find().sort({_id: -1}).limit(3).forEach(student => 
    print('  -', student.name, '(' + student.course + ')')
  );
"

echo ""
echo "======================================"
```

Make it executable:
```bash
chmod +x check-db.sh
./check-db.sh
```

---

## 💡 Pro Tips

### 1. **Real-Time Monitoring:**
```bash
# Watch for changes (runs every 2 seconds)
watch -n 2 'mongosh studentDB --quiet --eval "db.students.countDocuments()"'
```

### 2. **Export Data:**
```bash
# Export to JSON
mongoexport --db=studentDB --collection=students --out=students.json --pretty

# Export to CSV
mongoexport --db=studentDB --collection=students --type=csv --fields=name,age,course,status --out=students.csv
```

### 3. **Backup Database:**
```bash
mongodump --db=studentDB --out=./backup
```

### 4. **Restore Database:**
```bash
mongorestore --db=studentDB ./backup/studentDB
```

---

## 🎯 Quick Checklist

Before and after making changes in your app:

- [ ] Count total students
- [ ] View latest student
- [ ] Check specific student by name
- [ ] Verify status counts
- [ ] Check if all fields are saved (email, phone)
- [ ] Confirm updates are persisting

---

## 🔗 Useful Links

- MongoDB Compass: https://www.mongodb.com/try/download/compass
- MongoDB Shell Docs: https://docs.mongodb.com/mongodb-shell/
- MongoDB Query Docs: https://docs.mongodb.com/manual/tutorial/query-documents/

---

**Your data is safely stored and all operations are working! ✅**
