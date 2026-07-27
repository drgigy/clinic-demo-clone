import fs from "node:fs";
import os from "node:os";

const PROJECT_ID = "clinic-demo-clone-drgigy";
const DATABASE = "(default)";
const FIRESTORE_ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${encodeURIComponent(DATABASE)}/documents`;

const tests = ["Nerve test", "EEG", "BAER", "VEP", "MRI", "CT scan"];
const diagnoses = ["Epilepsy", "Headache", "Pain", "Stroke", "Parkinsons", "Others"];
const names = [
  ["Aarav Menon", "42", "Male"], ["Meera Nair", "36", "Female"], ["George Mathew", "68", "Male"],
  ["Ananya Krishnan", "24", "Female"], ["Ravi Pillai", "55", "Male"], ["Latha Thomas", "61", "Female"],
  ["Nikhil Varghese", "31", "Male"], ["Fatima Rahman", "47", "Female"], ["Suresh Kumar", "58", "Male"],
  ["Diya Joseph", "19", "Female"], ["Prakash Iyer", "63", "Male"], ["Susan Abraham", "52", "Female"],
  ["Vivek Raghavan", "45", "Male"], ["Riya Mathew", "27", "Female"], ["Balakrishnan Nair", "72", "Male"],
  ["Asha Biju", "39", "Female"], ["Kiran Das", "33", "Male"], ["Neena George", "49", "Female"],
  ["Harishankar Menon", "57", "Male"], ["Molly Jacob", "66", "Female"], ["Imran Khan", "41", "Male"],
  ["Priya S", "29", "Female"], ["John Kurian", "60", "Male"], ["Lakshmi Menon", "54", "Female"],
  ["Vishnu Mohan", "22", "Male"], ["Shalini Raj", "44", "Female"], ["Benny Thomas", "70", "Male"],
  ["Nandita Rao", "34", "Female"], ["Manoj K", "50", "Male"], ["Elsy Joseph", "64", "Female"],
  ["Aditya Pai", "17", "Male"], ["Rekha Soman", "48", "Female"], ["Jithin Babu", "38", "Male"],
  ["Maya Philip", "43", "Female"], ["Oommen Chacko", "76", "Male"], ["Sana Fathima", "25", "Female"]
];
const comments = ["elderly", "needs interpreter", "VIP", "doctor referral", "review reports", "relative", "long travel"];

function readFirebaseAccessToken() {
  const configPath = `${os.homedir()}/.config/configstore/firebase-tools.json`;
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!config.tokens?.access_token) throw new Error("Firebase CLI access token not found. Run firebase login first.");
  if (Date.now() > Number(config.tokens.expires_at || 0)) {
    throw new Error("Firebase CLI access token is expired. Run firebase login --reauth, then rerun this script.");
  }
  return config.tokens.access_token;
}

function pad(value, length = 2) {
  return String(value).padStart(length, "0");
}

function moneyForVisit(visitType, mode) {
  if (mode === "Teleconsultation") return visitType === "Review" ? 450 : 650;
  return visitType === "Review" ? 500 : 800;
}

function testAmount(selectedTests) {
  const rates = { "Nerve test": 1800, EEG: 1200, BAER: 900, VEP: 900, MRI: 0, "CT scan": 0 };
  return selectedTests.reduce((sum, test) => sum + (rates[test] || 0), 0);
}

function payMode(seed) {
  return ["Cash", "GPay", "Card"][seed % 3];
}

function makeNote(patient, idx) {
  const symptom = {
    Epilepsy: "recurrent seizure episodes, no new focal deficit",
    Headache: "episodic headache with nausea, no red flag symptoms",
    Pain: "neck and upper limb pain with intermittent paraesthesia",
    Stroke: "post-stroke follow-up with improving limb power",
    Parkinsons: "bradykinesia and tremor review",
    Others: "dizziness and sleep disturbance review"
  }[patient.diagnosis];
  const advice = patient.tests?.length ? patient.tests.join(", ") : "continue observation and review if symptoms worsen";
  return {
    text: `Chief Complaints:\n${symptom}.\n\nHistory of Present Illness:\nFictional demo patient attended on ${patient.date}. Symptoms are stable enough for outpatient management.\n\nDiagnosis:\n${patient.diagnosis}\n\nOrders:\n${advice}\n\nAdvice:\nMedication review, hydration, sleep hygiene, and follow-up as advised.`,
    html: `<b>Chief Complaints:</b><br>${symptom}.<br><br><b>History of Present Illness:</b><br>Fictional demo patient attended on ${patient.date}. Symptoms are stable enough for outpatient management.<br><br><b>Diagnosis:</b><br>${patient.diagnosis}<br><br><b>Orders:</b><br>${advice}<br><br><b>Advice:</b><br>Medication review, hydration, sleep hygiene, and follow-up as advised.`
  };
}

function makePatients() {
  const schedule = {
    "2026-05": [4, 6, 8, 11, 13, 15, 18, 20, 22, 25, 27, 29],
    "2026-06": [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29],
    "2026-07": [1, 3, 6, 8, 10, 13, 15, 17, 20, 22, 24, 27]
  };
  const counts = { "2026-05": 24, "2026-06": 28, "2026-07": 26 };
  const patients = [];
  let sequence = 1;

  Object.entries(counts).forEach(([month, count], monthIndex) => {
    for (let i = 0; i < count; i++) {
      const person = names[(i + monthIndex * 8) % names.length];
      const date = `${month}-${pad(schedule[month][i % schedule[month].length])}`;
      const diagnosis = diagnoses[(i + monthIndex) % diagnoses.length];
      const isReview = monthIndex > 0 && i % 3 !== 1;
      const patientNumber = isReview ? ((i + monthIndex * 5) % 36) + 1 : sequence++;
      const patientId = `26${pad(patientNumber, 4)}`;
      const mode = i % 5 === 2 ? "Teleconsultation" : "In clinic";
      const attendance = i % 11 === 0 ? "No show" : "Came";
      const selectedTests = attendance === "Came" && i % 4 === 0
        ? [tests[(i + 1) % tests.length]]
        : attendance === "Came" && i % 9 === 0
          ? [tests[(i + 2) % tests.length], tests[(i + 4) % tests.length]]
          : [];
      const consultAmount = attendance === "Came" ? String(moneyForVisit(isReview ? "Review" : "First consultation", mode)) : "";
      const testTotal = attendance === "Came" ? testAmount(selectedTests) : 0;
      const id = `demo-patient-${month}-${pad(i + 1)}`;
      patients.push({
        id,
        patientId,
        date,
        name: person[0],
        age: person[1],
        sex: person[2],
        mobile: `90000${pad((monthIndex + 1) * 1000 + i * 37, 5)}`,
        comments: i % 6 === 0 ? [comments[(i + monthIndex) % comments.length]] : [],
        visitType: isReview ? "Review" : "First consultation",
        mode,
        diagnosis,
        attendance,
        callbackStatus: attendance === "No show" ? (i % 22 === 0 ? "No response" : "Appointment given") : "",
        tests: selectedTests.filter((test) => testAmount([test]) > 0 || ["MRI", "CT scan"].includes(test)),
        consultAmount,
        consultPayMode: attendance === "Came" ? payMode(i + monthIndex) : "",
        testAmount: testTotal ? String(testTotal) : "",
        testPayMode: testTotal ? payMode(i + monthIndex + 1) : ""
      });
    }
  });
  return patients;
}

function makeMedicalRecords(patients) {
  return patients
    .filter((patient, idx) => patient.attendance === "Came" && idx % 3 === 0)
    .slice(0, 28)
    .map((patient, idx) => {
      const note = makeNote(patient, idx);
      const createdAt = `${patient.date}T${pad(10 + (idx % 6))}:${pad((idx * 7) % 60)}:00.000+05:30`;
      return {
        id: `demo-record-${patient.id}`,
        patientAppointmentId: patient.id,
        patientId: patient.patientId,
        patientKey: patient.patientId,
        name: patient.name,
        mobile: patient.mobile,
        date: patient.date,
        note: note.text,
        noteHtml: note.html,
        docs: { visit: note.html },
        details: {
          age: patient.age,
          sex: patient.sex,
          address: "Demo address, Fictional locality",
          diagnosis: patient.diagnosis,
          remarks: "Fictional demo clinical note.",
          allergy: idx % 5 === 0 ? "No known drug allergy" : "",
          currentMedications: idx % 4 === 0 ? "Existing medicines reviewed" : ""
        },
        source: "typed",
        recordKind: "visit",
        createdAt,
        updatedAt: createdAt
      };
    });
}

function makeAccounts() {
  const monthly = {
    "2026-05": { rent: 26000, salary: 42000, consumables: 11800, electricity: 7200, internet: 2300, maintenance: 6500, other: 9000, remittance: 52000 },
    "2026-06": { rent: 26000, salary: 44000, consumables: 13200, electricity: 8100, internet: 2300, maintenance: 4800, other: 12000, remittance: 58000 },
    "2026-07": { rent: 28000, salary: 45000, consumables: 12600, electricity: 8600, internet: 2400, maintenance: 7200, other: 10500, remittance: 61000 }
  };
  return Object.entries(monthly).flatMap(([month, value], monthIndex) => [
    { id: `demo-account-${month}-rent`, date: `${month}-03`, type: "Expense", amount: String(value.rent), mode: "Cheque", bank: "Rent", note: "Monthly clinic rent" },
    { id: `demo-account-${month}-salary`, date: `${month}-05`, type: "Expense", amount: String(value.salary), mode: "GPay", bank: "Staff salary", note: "Reception and assistant salary" },
    { id: `demo-account-${month}-consumables`, date: `${month}-09`, type: "Expense", amount: String(value.consumables), mode: "Card", bank: "Clinic consumables", note: "Paper, electrodes, disposables" },
    { id: `demo-account-${month}-electricity`, date: `${month}-12`, type: "Expense", amount: String(value.electricity), mode: "GPay", bank: "Electricity", note: "Electricity bill" },
    { id: `demo-account-${month}-internet`, date: `${month}-14`, type: "Expense", amount: String(value.internet), mode: "Card", bank: "Internet / phone", note: "Broadband and clinic phone" },
    { id: `demo-account-${month}-maintenance`, date: `${month}-18`, type: "Expense", amount: String(value.maintenance), mode: "Cash", bank: "Equipment maintenance", note: "Minor service and repairs" },
    { id: `demo-account-${month}-certificate-income`, date: `${month}-20`, type: "Other income", amount: String(value.other), mode: monthIndex % 2 ? "GPay" : "Cash", bank: "Other", note: "Certificates and forms" },
    { id: `demo-account-${month}-cash-remittance`, date: `${month}-26`, type: "Bank remittance", amount: String(value.remittance), mode: "Cash", bank: "Doctor primary bank account", note: "Cash deposited to bank" }
  ]);
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, firestoreValue(item)])) } };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: String(value) };
}

async function putDocument(accessToken, collection, document) {
  const url = `${FIRESTORE_ROOT}/${collection}/${encodeURIComponent(document.id)}`;
  const body = {
    fields: Object.fromEntries(Object.entries(document).map(([key, value]) => [key, firestoreValue(value)]))
  };
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${collection}/${document.id}: ${response.status} ${text}`);
  }
}

async function main() {
  const accessToken = readFirebaseAccessToken();
  const patients = makePatients();
  const medicalRecords = makeMedicalRecords(patients);
  const accounts = makeAccounts();
  const writes = [
    ...patients.map((document) => ["patients", document]),
    ...medicalRecords.map((document) => ["medicalRecords", document]),
    ...accounts.map((document) => ["accounts", document])
  ];

  for (const [collection, document] of writes) {
    await putDocument(accessToken, collection, document);
  }

  console.log(JSON.stringify({
    project: PROJECT_ID,
    patients: patients.length,
    medicalRecords: medicalRecords.length,
    accounts: accounts.length,
    months: ["2026-05", "2026-06", "2026-07"]
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
