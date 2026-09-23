import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkLtC4jVXvBqfF2_9x57JTuF2F1mOVWiA",
  authDomain: "my-assistants-72de6.firebaseapp.com",
  projectId: "my-assistants-72de6",
  storageBucket: "my-assistants-72de6.firebasestorage.app",
  messagingSenderId: "945083121765",
  appId: "1:945083121765:web:3a422ffe731d2d3879468c",
  measurementId: "G-P2DGCBEQJP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Seed Initial Data function to populate demo data if collections are empty
export async function seedInitialData() {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    if (studentsSnap.empty) {
      console.log("Seeding initial Firestore data for Sky Education...");
      
      const todayStr = new Date().toISOString().split("T")[0];
      const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2025-05"

      // Initial Students
      const sampleStudents = [
        {
          id: "std-101",
          name: "Aarav Sharma",
          fatherName: "Rajesh Sharma",
          contact: "+91 98765 43210",
          classSection: "Class 10 - A",
          admissionDate: "2024-04-10",
          monthlyFee: 3500,
          photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          createdAt: new Date().toISOString()
        },
        {
          id: "std-102",
          name: "Diya Patel",
          fatherName: "Suresh Patel",
          contact: "+91 98765 43211",
          classSection: "Class 10 - A",
          admissionDate: "2024-04-12",
          monthlyFee: 3500,
          photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          createdAt: new Date().toISOString()
        },
        {
          id: "std-103",
          name: "Rohan Gupta",
          fatherName: "Amit Gupta",
          contact: "+91 98765 43212",
          classSection: "Class 9 - B",
          admissionDate: "2024-05-01",
          monthlyFee: 3200,
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          createdAt: new Date().toISOString()
        },
        {
          id: "std-104",
          name: "Ananya Verma",
          fatherName: "Vikas Verma",
          contact: "+91 98765 43213",
          classSection: "Class 9 - B",
          admissionDate: "2024-05-05",
          monthlyFee: 3200,
          photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
          status: "Active",
          createdAt: new Date().toISOString()
        }
      ];

      for (const std of sampleStudents) {
        await setDoc(doc(db, "students", std.id), std);
      }

      // Initial Staff
      const sampleStaff = [
        {
          id: "stf-1",
          name: "Priya Nair",
          role: "Senior Teacher",
          contact: "+91 91234 56789",
          salary: 45000,
          assignedClass: "Class 10 - A",
          createdAt: new Date().toISOString()
        },
        {
          id: "stf-2",
          name: "Vikram Malhotra",
          role: "Mathematics Teacher",
          contact: "+91 91234 56790",
          salary: 42000,
          assignedClass: "Class 9 - B",
          createdAt: new Date().toISOString()
        }
      ];

      for (const stf of sampleStaff) {
        await setDoc(doc(db, "staff", stf.id), stf);
      }

      // Initial Fee Payment (for Aarav Sharma for current month)
      const sampleFees = [
        {
          id: "fee-201",
          studentId: "std-101",
          studentName: "Aarav Sharma",
          classSection: "Class 10 - A",
          month: currentMonthStr,
          amount: 3500,
          paymentDate: todayStr,
          receiptNo: "REC-" + Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString()
        }
      ];

      for (const fee of sampleFees) {
        await setDoc(doc(db, "fees", fee.id), fee);
      }

      // Initial Attendance
      const sampleAttendance = [
        {
          id: `${todayStr}_Class 10 - A`,
          date: todayStr,
          classSection: "Class 10 - A",
          records: {
            "std-101": "Present",
            "std-102": "Present"
          },
          createdAt: new Date().toISOString()
        },
        {
          id: `${todayStr}_Class 9 - B`,
          date: todayStr,
          classSection: "Class 9 - B",
          records: {
            "std-103": "Present",
            "std-104": "Absent"
          },
          createdAt: new Date().toISOString()
        }
      ];

      for (const att of sampleAttendance) {
        await setDoc(doc(db, "attendance", att.id), att);
      }

      // Initial Expenses
      const sampleExpenses = [
        {
          id: "exp-301",
          category: "Salary",
          amount: 87000,
          date: todayStr,
          description: "Monthly staff salaries payment",
          createdAt: new Date().toISOString()
        },
        {
          id: "exp-302",
          category: "Utilities",
          amount: 6500,
          date: todayStr,
          description: "Electricity and internet bills",
          createdAt: new Date().toISOString()
        }
      ];

      for (const exp of sampleExpenses) {
        await setDoc(doc(db, "expenses", exp.id), exp);
      }

      console.log("Seeding completed successfully!");
    }
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}
