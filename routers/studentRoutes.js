import express from "express";
import {
  createStudent,
  getStudents,
  getStudentInfo,
  updateStudent,
  deleteStudent,
  searchStudents,
  promoteStudentsByGrade,
  moveStudentsByGrade,
  generateStudentsPDF,   // ✅ Import new controller
} from "../controllers/studentController.js";

const router = express.Router();

// CREATE a new student
router.post("/", createStudent);

// GET all students
router.get("/", getStudents);

// GET a single student by studentId
router.get("/:studentId", getStudentInfo);

// UPDATE a student by studentId
router.put("/:studentId", updateStudent);

// DELETE a student by studentId
router.delete("/:studentId", deleteStudent);

// SEARCH students
router.get("/search", searchStudents);

// ✅ Promote students by grade
router.put("/promote-class/:grade/:type", promoteStudentsByGrade);


router.put("/move-class/:grade/:type/:direction", moveStudentsByGrade);

router.get("/students/pdf", generateStudentsPDF);




export default router;
