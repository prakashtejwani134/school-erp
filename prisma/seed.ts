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
  await prisma.user.deleteMany();

  // --- Users: 1 Director + 2 Teachers ---
  const director = await prisma.user.create({
    data: {
      name: "Vikram Malhotra",
      email: "director@greenwoodschool.edu",
      phone: "+919810000001",
      role: Role.DIRECTOR,
    },
  });

  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Priya Desai",
        email: "priya.desai@greenwoodschool.edu",
        phone: "+919810000002",
        role: Role.TEACHER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rohan Mehta",
        email: "rohan.mehta@greenwoodschool.edu",
        phone: "+919810000003",
        role: Role.TEACHER,
      },
    }),
  ]);

  console.log(
    `Created 1 director (${director.name}) and ${teachers.length} teachers`,
  );

  // --- Classes ---
  const class9A = await prisma.class.create({
    data: { name: "9", section: "A" },
  });
  const class10A = await prisma.class.create({
    data: { name: "10", section: "A" },
  });

  console.log("Created classes: 9-A, 10-A");

  // --- Fee Structures: Tuition + Exam Fee, per class ---
  const dueDate = firstOfNextMonth();

  const fees9A = {
    tuition: await prisma.feeStructure.create({
      data: {
        title: "Tuition Fee",
        amount: 15000,
        dueDate,
        classId: class9A.id,
      },
    }),
    exam: await prisma.feeStructure.create({
      data: { title: "Exam Fee", amount: 2000, dueDate, classId: class9A.id },
    }),
  };

  const fees10A = {
    tuition: await prisma.feeStructure.create({
      data: {
        title: "Tuition Fee",
        amount: 16000,
        dueDate,
        classId: class10A.id,
      },
    }),
    exam: await prisma.feeStructure.create({
      data: { title: "Exam Fee", amount: 2500, dueDate, classId: class10A.id },
    }),
  };

  console.log("Created fee structures: Tuition Fee, Exam Fee (per class)");

  // --- Students: 5 in Class 9-A, 5 in Class 10-A, Indian names ---
  const class9AStudents = [
    { firstName: "Aarav", lastName: "Sharma", phone: "+919820000001" },
    { firstName: "Vivaan", lastName: "Gupta", phone: "+919820000002" },
    { firstName: "Ishaan", lastName: "Verma", phone: "+919820000003" },
    { firstName: "Aditya", lastName: "Kumar", phone: "+919820000004" },
    { firstName: "Reyansh", lastName: "Singh", phone: "+919820000005" },
  ];

  const class10AStudents = [
    { firstName: "Ananya", lastName: "Iyer", phone: "+919820000006" },
    { firstName: "Diya", lastName: "Patel", phone: "+919820000007" },
    { firstName: "Saanvi", lastName: "Reddy", phone: "+919820000008" },
    { firstName: "Myra", lastName: "Nair", phone: "+919820000009" },
    { firstName: "Anika", lastName: "Joshi", phone: "+919820000010" },
  ];

  const students: {
    id: string;
    firstName: string;
    fees: { tuition: { id: string; amount: number }; exam: { id: string; amount: number } };
  }[] = [];

  let admissionCounter = 1;

  for (const s of class9AStudents) {
    const student = await prisma.student.create({
      data: {
        admissionNo: `GWS-9A-${String(admissionCounter).padStart(3, "0")}`,
        firstName: s.firstName,
        lastName: s.lastName,
        parentPhone: s.phone,
        classId: class9A.id,
        isDiscounted: admissionCounter === 3,
      },
    });
    students.push({ id: student.id, firstName: student.firstName, fees: fees9A });
    admissionCounter++;
  }

  admissionCounter = 1;
  for (const s of class10AStudents) {
    const student = await prisma.student.create({
      data: {
        admissionNo: `GWS-10A-${String(admissionCounter).padStart(3, "0")}`,
        firstName: s.firstName,
        lastName: s.lastName,
        parentPhone: s.phone,
        classId: class10A.id,
        isDiscounted: admissionCounter === 2,
      },
    });
    students.push({ id: student.id, firstName: student.firstName, fees: fees10A });
    admissionCounter++;
  }

  console.log(`Created ${students.length} students`);

  // --- Fee Dues + Receipts: a mix of pending dues and paid (receipted) dues ---
  let receiptCounter = 1;
  let paidCount = 0;
  let pendingCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    // Tuition due — most are paid (7/10), rest pending.
    const tuitionPaid = i < 7;
    // Exam due — roughly half paid, half pending.
    const examPaid = i % 2 === 0;

    const dueSpecs = [
      { structure: student.fees.tuition, paid: tuitionPaid },
      { structure: student.fees.exam, paid: examPaid },
    ];

    for (const spec of dueSpecs) {
      const feeDue = await prisma.feeDue.create({
        data: {
          studentId: student.id,
          feeStructureId: spec.structure.id,
          dueAmount: spec.structure.amount,
          isPaid: spec.paid,
        },
      });

      if (spec.paid) {
        paidCount++;
        const paymentMode = PAYMENT_MODES[receiptCounter % PAYMENT_MODES.length];
        const collectedBy = teachers[receiptCounter % teachers.length].name;
        const needsTransactionId =
          paymentMode === PaymentMode.UPI ||
          paymentMode === PaymentMode.BANK_TRANSFER;

        await prisma.feeReceipt.create({
          data: {
            receiptNo: `RCPT-2026-${String(receiptCounter).padStart(4, "0")}`,
            studentId: student.id,
            feeDueId: feeDue.id,
            paidAmount: spec.structure.amount,
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
    `Created fee dues for all students (${paidCount} paid with receipts, ${pendingCount} pending)`,
  );

  // --- Attendance: past 7 days for every student ---
  const attendanceRows = students.flatMap((student) =>
    Array.from({ length: 7 }, (_, dayOffset) => ({
      studentId: student.id,
      date: daysAgo(dayOffset),
      status: randomAttendanceStatus(),
    })),
  );

  await prisma.attendance.createMany({
    data: attendanceRows,
    skipDuplicates: true,
  });

  console.log(
    `Created ${attendanceRows.length} attendance records (past 7 days x ${students.length} students)`,
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
