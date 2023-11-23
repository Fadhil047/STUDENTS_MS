import {
    $query,
    $update,
    Record,
    StableBTreeMap,
    match,
    Result,
    nat64,
    ic,
    Vec,
    Opt,
  } from 'azle';
  import { v4 as uuidv4 } from 'uuid';
  
  // Define the structure of a student record
  type Student = Record<{
    id: string;
    name: string;
    dateBirth: string;
    dateAdmission: string;
    course: string;
    courseType: string;
    location: string;
    parent: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
  }>;
  
  // Define the structure of a student payload used for creating and updating students
  type StudentPayload = Record<{
    name: string;
    dateBirth: string;
    dateAdmission: string;
    course: string;
    courseType: string;
    location: string;
    parent: string;
    parentNumber: nat64;
  }>;
  
  // Create a storage map for students
  const studentsStorage = new StableBTreeMap<string, Student>(0, 44, 1024);
  
  // Function to create a new student
  $update;
  export function createStudent(payload: StudentPayload): Result<Student, string> {
    // Validate payload properties
    if (!payload.name || !payload.dateBirth || !payload.dateAdmission || !payload.course ||
      !payload.courseType || !payload.location || !payload.parent || !payload.parentNumber) {
      return Result.Err<Student, string>('Invalid payload properties for creating a student.');
    }
  
    try {
      // Create a new student record
      const student: Student = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        name: payload.name,
        dateBirth: payload.dateBirth,
        dateAdmission: payload.dateAdmission,
        course: payload.course,
        courseType: payload.courseType,
        location: payload.location,
        parent: payload.parent,
      };
  
      // Insert the new student into the storage map
      studentsStorage.insert(student.id, student);
  
      // Return the result
      return Result.Ok<Student, string>(student);
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err<Student, string>('Error creating a student.');
    }
  }
  
  // Function to get a student by ID
  $query;
  export function getStudentById(id: string): Result<Student, string> {
    // Validate ID
    if (!id) {
      return Result.Err<Student, string>('Invalid ID for getting a student.');
    }
  
    try {
      // Use match pattern to handle Some and None cases
      return match(studentsStorage.get(id), {
        Some: (student) => Result.Ok<Student, string>(student),
        None: () => Result.Err<Student, string>(`Student with id=${id} not found.`),
      });
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err<Student, string>('Error retrieving student by ID.');
    }
  }
  
  // Function to get a student by name
  $query;
  export function getStudentByName(name: string): Result<Student, string> {
    // Validate name
    if (!name) {
      return Result.Err<Student, string>('Invalid name for getting a student.');
    }
  
    try {
      // Get all students from the storage map
      const students = studentsStorage.values();
  
      // Find the student with the provided name (case-insensitive)
      const foundStudent = students.find(
        (student) => student.name.toLowerCase() === name.toLowerCase()
      );
  
      // Return the result based on whether the student is found or not
      if (foundStudent) {
        return Result.Ok<Student, string>(foundStudent);
      } else {
        return Result.Err<Student, string>(`Student with name="${name}" not found.`);
      }
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err<Student, string>('Error retrieving student by name.');
    }
  }
  
  // Function to get all students
  $query;
  export function getAllStudents(): Result<Vec<Student>, string> {
    try {
      // Return the result with all students from the storage map
      return Result.Ok(studentsStorage.values());
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err('Error retrieving all students.');
    }
  }
  
  // Function to update a student by ID
  $update;
  export function updateStudent(id: string, payload: StudentPayload): Result<Student, string> {
    // Validate ID and payload properties
    if (!id || !payload.name || !payload.dateBirth || !payload.dateAdmission || !payload.course ||
      !payload.courseType || !payload.location || !payload.parent || !payload.parentNumber) {
      return Result.Err<Student, string>('Invalid ID or payload properties for updating a student.');
    }
  
    try {
      // Use match pattern to handle Some and None cases
      return match(studentsStorage.get(id), {
        Some: (existingStudent) => {
          // Create an updated student record
          const updatedStudent: Student = {
            ...existingStudent,
            updatedAt: Opt.Some(ic.time()),
            name: payload.name,
            dateBirth: payload.dateBirth,
            dateAdmission: payload.dateAdmission,
            course: payload.course,
            courseType: payload.courseType,
            location: payload.location,
            parent: payload.parent,
          };
  
          // Insert the updated student into the storage map
          studentsStorage.insert(updatedStudent.id, updatedStudent);
  
          // Return the result
          return Result.Ok<Student, string>(updatedStudent);
        },
        None: () => Result.Err<Student, string>(`Student with id=${id} not found.`),
      });
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err<Student, string>('Error updating student.');
    }
  }
  
  // Function to delete a student by ID
  $update;
  export function deleteStudent(id: string): Result<Student, string> {
    // Validate ID
    if (!id) {
      return Result.Err<Student, string>('Invalid ID for deleting a student.');
    }
  
    try {
      // Use match pattern to handle Some and None cases
      return match(studentsStorage.get(id), {
        Some: (existingStudent) => {
          // Remove the student from the storage map
          studentsStorage.remove(id);
  
          // Return the result
          return Result.Ok<Student, string>(existingStudent);
        },
        None: () => Result.Err<Student, string>(`Student with id=${id} not found.`),
      });
    } catch (error) {
      // Return an error result with a meaningful message
      return Result.Err<Student, string>('Error deleting student.');
    }
  }
  
  // Cryptographic utility for generating random values
  globalThis.crypto = {
    //@ts-ignore
    getRandomValues: () => {
      let array = new Uint8Array(32);
  
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
  
      return array;
    },
  };
  