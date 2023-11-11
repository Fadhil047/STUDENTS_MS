import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { sha256 as crypto } from 'crypto-js';

// Now we make some models;
//students, studentspayload, error

type students = Record<{
  id: string;
  name: string;
  dateBirth: string;
  dateAdmission: string;
  course: string;
  courseType: string;
  location: string;
  parent: string;
  createdAt: nat64;
  updatedAt: nat64;
}>;

type studentspayload = Record<{
  name: string;
  dateBirth: string;
  dateAdmission: string;
  course: string;
  courseType: string;
  location: string;
  parent: string;
  parentNumber: nat64;
  createdAt: nat64;
  updatedAt: nat64;
}>;

const studentsStorage = new StableBTreeMap<string, students>(0, 44, 1024);

$update;
export function CreateStudents(payload: Studentspayload): Result<students, string> {
  const hashedId = crypto.SHA256(payload.name + payload.dateBirth).toString();
  const students: Students = {
    id: hashedId,
    createdAt: ic.time(),
    updatedAt: Opt.None,
    ...payload,
    parent: ic.caller(),
  };
  studentsStorage.insert(students.id, students);
  return Result.Ok<Students, string>(students);
}

$query;
export function getStudentsById(id: string): Result<students, string> {
  return match(studentsStorage.get(id), {
    Some: (students) => Result.Ok<Students, string>(students),
    None: () => Result.Err<Students, string>(`students with id=${id} not found.`),
  });
}

$query;
export function getStudentsByName(name: string): Result<students, string> {
  const students = studentsStorage.values();

  const foundStudents = students.find((students) => {
    const studentName = students.name.toLowerCase();
    return studentName.includes(name.toLowerCase());
  });

  if (foundStudents) {
    return Result.Ok<Students, string>(foundStudents);
  }

  return Result.Err<Students, string>(`Students with name ="${name}" not found.`);
}

$query;
export function getAllStudents(): Result<Vec<somestudents>, string> {
  return Result.Ok(studentsStorage.values());
}

$update;
export function updatedStudents(id: string, payload: studentspayload): Result<students, string> {
  return match(studentsStorage.get(id), {
    Some: (existingStudents) => {
      const updatedStudents: Students = {
        ...existingStudents,
        ...payload,
        updatedAt: Opt.some(ic.time()),
      };
      studentsStorage.insert(updatedStudents.id, updatedStudents);
      return Result.Ok<Students, string>(updatedStudents);
    },
    None: () => Result.Err<Students, string>(`students with id=${id} not found.`),
  });
}

$update;
export function deleteStudents(id: string): Result<Students, string> {
  return match(studentsStorage.get(id), {
    Some: (existingStudents) => {
      studentsStorage.remove(id);
      return Result.Ok<Students, string>(existingStudents);
    },
    None: () => Result.Err<Students, string>(`Students with id=${id} not found.`),
  });
}

globalThis.crypto = crypto;
