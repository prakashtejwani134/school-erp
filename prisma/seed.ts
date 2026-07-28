import "dotenv/config";
import {
  PrismaClient,
  Role,
  PaymentMode,
  AttendanceStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Built with Date.UTC because Attendance.date is a Postgres `@db.Date` column,
// which is compared/stored by its UTC calendar day. In timezones ahead of UTC
// (e.g. IST), a local-midnight Date silently shifts back a day once it
// round-trips through the driver — this construction avoids that.
function daysAgo(n: number): Date {
  const now = new Date();
  const utcMidnight = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() - n);
  return utcMidnight;
}

function firstOfNextMonth(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function randomAttendanceStatus(): AttendanceStatus {
  const r = Math.random();
  if (r < 0.78) return AttendanceStatus.PRESENT;
  if (r < 0.88) return AttendanceStatus.ABSENT;
  if (r < 0.96) return AttendanceStatus.LATE;
  return AttendanceStatus.LEAVE;
}

const PAYMENT_MODES = [
  PaymentMode.CASH,
  PaymentMode.UPI,
  PaymentMode.BANK_TRANSFER,
  PaymentMode.CHEQUE,
] as const;

type StaffSpec = { name: string; email: string; phone: string };
type ClassSpec = {
  name: string;
  section: string;
  tuitionAmount: number;
  examAmount: number;
  students: { firstName: string; lastName: string; phone: string }[];
};

type SchoolSpec = {
  code: string;
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  currentAcademicYear: string;
  admissionPrefix: string;
  receiptPrefix: string;
  teachers: StaffSpec[];
  admin: StaffSpec;
  parent: StaffSpec;
  classes: ClassSpec[];
};

/** Creates one school's users, classes, fee structures, students, dues/receipts, and attendance. Returns the school id so the caller can attach a shared Director membership. */
async function seedSchool(spec: SchoolSpec) {
  const school = await prisma.school.create({
    data: {
      code: spec.code,
      schoolName: spec.schoolName,
      address: spec.address,
      phone: spec.phone,
      email: spec.email,
      currency: "INR",
      currentAcademicYear: spec.currentAcademicYear,
    },
  });

  const teachers = await Promise.all(
    spec.teachers.map((t) =>
      prisma.user.create({
        data: { name: t.name, email: t.email, phone: t.phone },
      }),
    ),
  );
  await Promise.all(
    teachers.map((teacher) =>
      prisma.userSchool.create({
        data: { userId: teacher.id, schoolId: school.id, role: Role.TEACHER },
      }),
    ),
  );

  const admin = await prisma.user.create({
    data: { name: spec.admin.name, email: spec.admin.email, phone: spec.admin.phone },
  });
  await prisma.userSchool.create({
    data: { userId: admin.id, schoolId: school.id, role: Role.ADMIN },
  });

  // --- Circulars: a couple of recent, realistic notices so the parent
  // portal's "New Circulars" attention card and /parent/circulars page have
  // real content to show instead of an empty state. ---
  await prisma.circular.createMany({
    data: [
      {
        schoolId: school.id,
        title: "PTM Scheduled for Friday",
        body: "A Parent-Teacher Meeting for all classes will be held this Friday from 9:00 AM to 12:00 PM. Please collect your ward's progress report from the class teacher.",
        createdBy: admin.id,
        publishedAt: daysAgo(1),
      },
      {
        schoolId: school.id,
        title: "Annual Sports Day Notice",
        body: "The Annual Sports Day will be held on the school grounds next week. Students should report in their house colors by 7:30 AM. Parents are welcome to attend.",
        createdBy: admin.id,
        publishedAt: daysAgo(3),
      },
    ],
  });

  const parent = await prisma.user.create({
    data: { name: spec.parent.name, email: spec.parent.email, phone: spec.parent.phone },
  });
  await prisma.userSchool.create({
    data: { userId: parent.id, schoolId: school.id, role: Role.PARENT },
  });

  const dueDate = firstOfNextMonth();

  const students: {
    id: string;
    fees: { tuition: { id: string; amount: number }; exam: { id: string; amount: number } };
  }[] = [];

  for (const classSpec of spec.classes) {
    const cls = await prisma.class.create({
      data: { schoolId: school.id, name: classSpec.name, section: classSpec.section },
    });

    const tuition = await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        title: "Tuition Fee",
        amount: classSpec.tuitionAmount,
        dueDate,
        classId: cls.id,
      },
    });
    const exam = await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        title: "Exam Fee",
        amount: classSpec.examAmount,
        dueDate,
        classId: cls.id,
      },
    });

    let admissionCounter = 1;
    for (const s of classSpec.students) {
      const student = await prisma.student.create({
        data: {
          schoolId: school.id,
          admissionNo: `${spec.admissionPrefix}-${classSpec.name}${classSpec.section}-${String(admissionCounter).padStart(3, "0")}`,
          firstName: s.firstName,
          lastName: s.lastName,
          parentPhone: s.phone,
          classId: cls.id,
          isDiscounted: admissionCounter === 3,
        },
      });
      students.push({ id: student.id, fees: { tuition, exam } });
      admissionCounter++;
    }
  }

  console.log(
    `  ${spec.schoolName}: ${spec.classes.length} classes, ${students.length} students`,
  );

  // --- Fee Dues + Receipts: a mix of pending and paid, with a range of
  // overdue days so the defaulter-risk engine has real variance to score. ---
  let receiptCounter = 1;
  let paidCount = 0;
  let pendingCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    // Tuition due — most are paid (7/10), rest pending.
    const tuitionPaid = i % 10 < 7;
    // Exam due — roughly half paid, half pending.
    const examPaid = i % 2 === 0;

    const dueSpecs = [
      { structure: student.fees.tuition, paid: tuitionPaid },
      { structure: student.fees.exam, paid: examPaid },
    ];

    for (const dueSpec of dueSpecs) {
      const feeDue = await prisma.feeDue.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          feeStructureId: dueSpec.structure.id,
          dueAmount: dueSpec.structure.amount,
          isPaid: dueSpec.paid,
        },
      });

      if (dueSpec.paid) {
        paidCount++;
        const paymentMode = PAYMENT_MODES[receiptCounter % PAYMENT_MODES.length];
        const collectedBy = teachers[receiptCounter % teachers.length].name;
        const needsTransactionId =
          paymentMode === PaymentMode.UPI ||
          paymentMode === PaymentMode.BANK_TRANSFER;

        await prisma.feeReceipt.create({
          data: {
            schoolId: school.id,
            receiptNo: `${spec.receiptPrefix}-2026-${String(receiptCounter).padStart(4, "0")}`,
            studentId: student.id,
            feeDueId: feeDue.id,
            paidAmount: dueSpec.structure.amount,
            paymentMode,
            collectedBy,
            transactionId: needsTransactionId
              ? `TXN${100000 + receiptCounter}`
              : null,
            createdAt: daysAgo(1 + (receiptCounter % 6)),
          },
        });
        receiptCounter++;
      } else {
        pendingCount++;
      }
    }
  }

  console.log(
    `  ${spec.schoolName}: fee dues created (${paidCount} paid with receipts, ${pendingCount} pending)`,
  );

  // --- Attendance: past 7 days for every student ---
  const attendanceRows = students.flatMap((student) =>
    Array.from({ length: 7 }, (_, dayOffset) => ({
      schoolId: school.id,
      studentId: student.id,
      date: daysAgo(dayOffset),
      status: randomAttendanceStatus(),
    })),
  );

  await prisma.attendance.createMany({
    data: attendanceRows,
    skipDuplicates: true,
  });

  console.log(`  ${spec.schoolName}: ${attendanceRows.length} attendance records`);

  return school;
}

async function main() {
  console.log("Seeding database...");

  // Clean slate — FK-safe delete order.
  await prisma.feeReceipt.deleteMany();
  await prisma.feeDue.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.class.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feeCategoryRule.deleteMany();
  await prisma.userSchool.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // The Director is shared across both schools, seeded once up front, so
  // logging in as Director has a real switcher to demo.
  const director = await prisma.user.create({
    data: {
      name: "Vikram Malhotra",
      email: "director@greenwoodschool.edu",
      phone: "+919810000001",
    },
  });

  const greenwood = await seedSchool({
    code: "GWS",
    schoolName: "Greenwood School",
    address: "12 MG Road, Mumbai, Maharashtra 400001",
    phone: "+912212345678",
    email: "info@greenwoodschool.edu",
    currentAcademicYear: "2025-2026",
    admissionPrefix: "GWS",
    receiptPrefix: "RCPT-GWS",
    teachers: [
      { name: "Priya Desai", email: "priya.desai@greenwoodschool.edu", phone: "+919810000002" },
      { name: "Rohan Mehta", email: "rohan.mehta@greenwoodschool.edu", phone: "+919810000003" },
    ],
    admin: { name: "Anita Rao", email: "accounts@greenwoodschool.edu", phone: "+919810000004" },
    parent: { name: "Kavita Sharma", email: "kavita.sharma@example.com", phone: "+919820000101" },
    classes: [
      {
        name: "9",
        section: "A",
        tuitionAmount: 15000,
        examAmount: 2000,
        students: [
          { firstName: "Aarav", lastName: "Sharma", phone: "+919820000001" },
          { firstName: "Vivaan", lastName: "Gupta", phone: "+919820000002" },
          { firstName: "Ishaan", lastName: "Verma", phone: "+919820000003" },
          { firstName: "Aditya", lastName: "Kumar", phone: "+919820000004" },
          { firstName: "Reyansh", lastName: "Singh", phone: "+919820000005" },
        ],
      },
      {
        name: "10",
        section: "A",
        tuitionAmount: 16000,
        examAmount: 2500,
        students: [
          { firstName: "Ananya", lastName: "Iyer", phone: "+919820000006" },
          { firstName: "Diya", lastName: "Patel", phone: "+919820000007" },
          { firstName: "Saanvi", lastName: "Reddy", phone: "+919820000008" },
          { firstName: "Myra", lastName: "Nair", phone: "+919820000009" },
          { firstName: "Anika", lastName: "Joshi", phone: "+919820000010" },
        ],
      },
    ],
  });

  // Link Kavita Sharma (Greenwood's seeded parent) to her son Aarav Sharma,
  // so the parent-portal auth flow (guardianId lookup) has a real row to
  // resolve during local/dev testing.
  const kavitaSharma = await prisma.user.findUniqueOrThrow({
    where: { email: "kavita.sharma@example.com" },
  });
  const aaravSharma = await prisma.student.update({
    where: { admissionNo: "GWS-9A-001" },
    data: { guardianId: kavitaSharma.id },
  });

  // Override Aarav's random attendance with a fixed mix below the 85%
  // threshold and a 3-day absence streak ending today, so the parent
  // portal's AttentionStrip has a real low-attendance card to demo.
  await prisma.attendance.deleteMany({ where: { studentId: aaravSharma.id } });
  const aaravAttendanceStatuses: AttendanceStatus[] = [
    AttendanceStatus.ABSENT, // today
    AttendanceStatus.ABSENT, // yesterday
    AttendanceStatus.ABSENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
  ];
  await prisma.attendance.createMany({
    data: aaravAttendanceStatuses.map((status, dayOffset) => ({
      schoolId: greenwood.id,
      studentId: aaravSharma.id,
      date: daysAgo(dayOffset),
      status,
    })),
  });

  const riverside = await seedSchool({
    code: "RIS",
    schoolName: "Riverside International School",
    address: "45 Residency Road, Bengaluru, Karnataka 560025",
    phone: "+918022345678",
    email: "info@riversideintl.edu",
    currentAcademicYear: "2025-2026",
    admissionPrefix: "RIS",
    receiptPrefix: "RCPT-RIS",
    teachers: [
      { name: "Neha Kapoor", email: "neha.kapoor@riversideintl.edu", phone: "+918010000002" },
      { name: "Arjun Nair", email: "arjun.nair@riversideintl.edu", phone: "+918010000003" },
    ],
    admin: { name: "Sunita Iyer", email: "accounts@riversideintl.edu", phone: "+918010000004" },
    parent: { name: "Meera Pillai", email: "meera.pillai@example.com", phone: "+918020000101" },
    classes: [
      {
        name: "8",
        section: "A",
        tuitionAmount: 18000,
        examAmount: 2200,
        students: [
          { firstName: "Krishna", lastName: "Rao", phone: "+918020000001" },
          { firstName: "Advait", lastName: "Bhat", phone: "+918020000002" },
          { firstName: "Kabir", lastName: "Shetty", phone: "+918020000003" },
          { firstName: "Arnav", lastName: "Hegde", phone: "+918020000004" },
          { firstName: "Vihaan", lastName: "Kulkarni", phone: "+918020000005" },
        ],
      },
      {
        name: "9",
        section: "B",
        tuitionAmount: 19000,
        examAmount: 2600,
        students: [
          { firstName: "Aadhya", lastName: "Menon", phone: "+918020000006" },
          { firstName: "Sara", lastName: "D'Souza", phone: "+918020000007" },
          { firstName: "Riya", lastName: "Poojary", phone: "+918020000008" },
          { firstName: "Ira", lastName: "Achar", phone: "+918020000009" },
          { firstName: "Navya", lastName: "Bhandari", phone: "+918020000010" },
        ],
      },
    ],
  });

  await prisma.userSchool.createMany({
    data: [
      { userId: director.id, schoolId: greenwood.id, role: Role.DIRECTOR },
      { userId: director.id, schoolId: riverside.id, role: Role.DIRECTOR },
    ],
  });

  console.log(
    `Created 2 schools (${greenwood.schoolName}, ${riverside.schoolName}), Director shared across both`,
  );
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
