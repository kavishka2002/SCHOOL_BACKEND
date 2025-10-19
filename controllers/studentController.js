import Student from "../models/student.js";
import { isAdmin } from "./userController.js"; // if needed
import PDFDocument from "pdfkit"; // KEEP ONLY THIS ONE


// CREATE a student
export async function createStudent(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const student = new Student(req.body);

    try {
        const response = await student.save();
        res.json({ message: "Student created successfully", student: response });
    } catch (error) {
        console.error("Error creating student:", error);
        return res.status(500).json({ message: "Failed to create student" });
    }
}

// GET all students
export async function getStudents(req, res) {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Failed to fetch students" });
    }
}

// GET a single student by studentId
export async function getStudentInfo(req, res) {
    try {
        const studentId = req.params.studentId;
        const student = await Student.findOne({ studentId });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        console.error("Error fetching student info:", error);
        res.status(500).json({ message: "Failed to fetch student info" });
    }
}

// UPDATE a student
export async function updateStudent(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const studentId = req.params.studentId;
    const data = req.body;

    try {
        const updatedStudent = await Student.findOneAndUpdate({ studentId }, data, { new: true });
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ message: "Student updated successfully", student: updatedStudent });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Failed to update student" });
    }
}

// DELETE a student
export async function deleteStudent(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        const studentId = req.params.studentId;
        const deletedStudent = await Student.findOneAndDelete({ studentId });

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Failed to delete student" });
    }
}

// SEARCH students by name, grade or course
export async function searchStudents(req, res) {
    try {
        const { name, grade, course } = req.query;
        let query = {};

        if (name) query.name = { $regex: name, $options: "i" };
        if (grade) query.grade = grade;
        if (course) query.courses = { $elemMatch: { courseName: { $regex: course, $options: "i" } } };

        const students = await Student.find(query);
        res.json(students);
    } catch (error) {
        console.error("Error searching students:", error);
        res.status(500).json({ message: "Failed to search students" });
    }
}

export const promoteStudentsByGrade = async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    const type = req.params.type; // <-- Grade type (A or B)

    if (grade === 13) {
      // Grade 13 → graduate → deactivate
      const result = await Student.updateMany(
        { gradeNumber: 13, gradeType: type },
        { $set: { isActive: false } }
      );
      return res.json({ message: `Grade 13 ${type} students graduated`, result });
    } else {
      // Promote only given grade + type
      const result = await Student.updateMany(
        { gradeNumber: grade, gradeType: type },
        { $inc: { gradeNumber: 1 } }
      );
      return res.json({
        message: `Grade ${grade} ${type} promoted to Grade ${grade + 1}`,
        result,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/studentController.js
export const moveStudentsByGrade = async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    const type = req.params.type;   // A or B
    const direction = req.params.direction; // "up" or "down"

    // increment amount: +1 (up) or -1 (down)
    const inc = direction === "down" ? -1 : 1;

    // Special case: Grade 13 + up → graduate
    if (grade === 13 && direction === "up") {
      const result = await Student.updateMany(
        { gradeNumber: 13, gradeType: type },
        { $set: { isActive: false } }
      );
      return res.json({ message: `Grade 13 ${type} students graduated`, result });
    }

    // Special case: Grade 1 + down → can't go below 1
    if (grade === 1 && direction === "down") {
      return res.status(400).json({ message: "Grade 1 cannot be lowered further" });
    }

    // Normal promotion/demotion
    const result = await Student.updateMany(
      { gradeNumber: grade, gradeType: type },
      { $inc: { gradeNumber: inc } }
    );

    return res.json({
      message: `Grade ${grade} ${type} moved to Grade ${grade + inc}`,
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
export const generateStudentsPDF = async (req, res) => {
  try {
    const students = await Student.find().sort({ gradeNumber: 1, gradeType: 1, name: 1 });

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Students_Report.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(18).text("MR Wilpita MV - Student List", { align: "center" });
    doc.moveDown(1);

    // Group students by grade
    const studentsByGrade = students.reduce((acc, student) => {
      const gradeLabel = `${student.gradeLevel}-${student.gradeNumber}${student.gradeType}`;
      if (!acc[gradeLabel]) acc[gradeLabel] = [];
      acc[gradeLabel].push(student);
      return acc;
    }, {});

    for (const grade of Object.keys(studentsByGrade)) {
      doc.fontSize(14).fillColor("black").text(`Class ${grade} (${studentsByGrade[grade].length})`);
      doc.moveDown(0.5);

      // ---- Group by gender inside grade ----
      const males = studentsByGrade[grade].filter((s) => s.gender === "Male");
      const females = studentsByGrade[grade].filter((s) => s.gender === "Female");

      // Print function for each gender group
      const printGroup = (title, group) => {
        if (!group.length) return;

        doc.fontSize(12).fillColor("blue").text(`${title} (${group.length})`);
        doc.moveDown(0.3);

        // Table Header
        doc.fontSize(10).fillColor("black");
        doc.text("ID", { continued: true, width: 50 });
        doc.text("Name", { continued: true, width: 120 });
        doc.text("Age", { continued: true, width: 40 });
        doc.text("Parent", { continued: true, width: 100 });
        doc.text("Phone", { continued: true, width: 80 });
        doc.text("Status", { width: 60 });
        doc.moveDown(0.3);

        // Table Rows
        group.forEach((s) => {
          doc.text(s.studentId.toString(), { continued: true, width: 50 });
          doc.text(s.name, { continued: true, width: 120 });
          doc.text(calculateAge(s.dateOfBirth).toString(), { continued: true, width: 40 });
          doc.text(s.parent, { continued: true, width: 100 });
          doc.text(s.phoneNumber || "-", { continued: true, width: 80 });
          doc.text(s.isActive ? "Active" : "Inactive", { width: 60 });
        });

        doc.moveDown(1);
      };

      // Print boys and girls separately
      printGroup("Male Students", males);
      printGroup("Female Students", females);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
