import { PrismaClient, UserRole, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create departments
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering'
    }
  })

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      description: 'Department of Electronics and Communication Engineering'
    }
  })

  const meDept = await prisma.department.create({
    data: {
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Department of Mechanical Engineering'
    }
  })

  // Create courses
  const cseCourse = await prisma.course.create({
    data: {
      name: 'Bachelor of Technology in Computer Science',
      code: 'BTECH-CSE',
      duration: 4,
      description: '4-year undergraduate program in Computer Science',
      departmentId: cseDept.id
    }
  })

  const eceCourse = await prisma.course.create({
    data: {
      name: 'Bachelor of Technology in Electronics',
      code: 'BTECH-ECE',
      duration: 4,
      description: '4-year undergraduate program in Electronics',
      departmentId: eceDept.id
    }
  })

  const meCourse = await prisma.course.create({
    data: {
      name: 'Bachelor of Technology in Mechanical',
      code: 'BTECH-ME',
      duration: 4,
      description: '4-year undergraduate program in Mechanical Engineering',
      departmentId: meDept.id
    }
  })

  // Create Admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: hashedPassword,
      name: 'System Administrator',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      admin: {
        create: {}
      }
    }
  })

  // Create HOD users
  const cseHod = await prisma.user.create({
    data: {
      email: 'hod.cse@college.edu',
      password: hashedPassword,
      name: 'Dr. John Smith',
      phone: '+1234567891',
      role: UserRole.HOD,
      faculty: {
        create: {
          employeeId: 'HOD001',
          departmentId: cseDept.id,
          designation: 'Professor & HOD',
          qualification: 'PhD in Computer Science',
          experience: 20,
          joiningDate: new Date('2010-01-15'),
          isHOD: true
        }
      }
    }
  })

  const eceHod = await prisma.user.create({
    data: {
      email: 'hod.ece@college.edu',
      password: hashedPassword,
      name: 'Dr. Jane Doe',
      phone: '+1234567892',
      role: UserRole.HOD,
      faculty: {
        create: {
          employeeId: 'HOD002',
          departmentId: eceDept.id,
          designation: 'Professor & HOD',
          qualification: 'PhD in Electronics',
          experience: 18,
          joiningDate: new Date('2012-03-20'),
          isHOD: true
        }
      }
    }
  })

  // Create Faculty users
  const faculty1 = await prisma.user.create({
    data: {
      email: 'faculty1@college.edu',
      password: hashedPassword,
      name: 'Prof. Alice Johnson',
      phone: '+1234567893',
      role: UserRole.FACULTY,
      faculty: {
        create: {
          employeeId: 'FAC001',
          departmentId: cseDept.id,
          designation: 'Assistant Professor',
          qualification: 'MTech in Computer Science',
          experience: 5,
          joiningDate: new Date('2019-07-01')
        }
      }
    }
  })

  const faculty2 = await prisma.user.create({
    data: {
      email: 'faculty2@college.edu',
      password: hashedPassword,
      name: 'Prof. Bob Wilson',
      phone: '+1234567894',
      role: UserRole.FACULTY,
      faculty: {
        create: {
          employeeId: 'FAC002',
          departmentId: eceDept.id,
          designation: 'Associate Professor',
          qualification: 'PhD in Electronics',
          experience: 10,
          joiningDate: new Date('2014-08-15')
        }
      }
    }
  })

  // Create Student users
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@college.edu',
      password: hashedPassword,
      name: 'Alex Thompson',
      phone: '+1234567895',
      role: UserRole.STUDENT,
      student: {
        create: {
          rollNumber: 'CSE2021001',
          admissionNo: 'ADM2021001',
          courseId: cseCourse.id,
          semester: 3,
          batch: '2021-2025',
          dateOfBirth: new Date('2002-05-15'),
          gender: Gender.MALE,
          address: '123 Main St, City',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          pincode: '100001',
          parentName: 'Robert Thompson',
          parentPhone: '+1234567896',
          parentEmail: 'robert.thompson@email.com',
          admissionDate: new Date('2021-08-01')
        }
      }
    }
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@college.edu',
      password: hashedPassword,
      name: 'Sarah Davis',
      phone: '+1234567897',
      role: UserRole.STUDENT,
      student: {
        create: {
          rollNumber: 'ECE2021002',
          admissionNo: 'ADM2021002',
          courseId: eceCourse.id,
          semester: 3,
          batch: '2021-2025',
          dateOfBirth: new Date('2002-08-20'),
          gender: Gender.FEMALE,
          address: '456 Oak Ave, Town',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          pincode: '90001',
          parentName: 'Michael Davis',
          parentPhone: '+1234567898',
          parentEmail: 'michael.davis@email.com',
          admissionDate: new Date('2021-08-01')
        }
      }
    }
  })

  // Update departments with HODs
  await prisma.department.update({
    where: { id: cseDept.id },
    data: { hodId: cseHod.faculty?.id }
  })

  await prisma.department.update({
    where: { id: eceDept.id },
    data: { hodId: eceHod.faculty?.id }
  })

  console.log('Database seeded successfully!')
  console.log('Default credentials:')
  console.log('Admin: admin@college.edu / password123')
  console.log('HOD CSE: hod.cse@college.edu / password123')
  console.log('HOD ECE: hod.ece@college.edu / password123')
  console.log('Faculty 1: faculty1@college.edu / password123')
  console.log('Faculty 2: faculty2@college.edu / password123')
  console.log('Student 1: student1@college.edu / password123')
  console.log('Student 2: student2@college.edu / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })