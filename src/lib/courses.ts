

export type CourseCategory = 'Obrigatória' | 'Eletiva' | 'Unknown';

export type Course = {
  id: string;
  apiId: string; // The _id from the API
  disciplineId: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  creditLock: number;
  dependencies: string[];
  category: CourseCategory;
  row: number;
  isElectiveGroup?: boolean;
  electives?: Course[];
};

export type CourseIdMapping = { [key: string]: string };

interface ApiRequirement {
  type: string;
  description: string;
}

interface ApiCourse {
  _id: string;
  name: string;
  period: string;
  type: string;
  credits: number;
  creditLock: string;
  disciplineId: string;
  requirements: ApiRequirement[];
}

const FLOWCHART_LAYOUT: Omit<Course, 'dependencies' | 'category' | 'name' | 'credits' | 'electives' | 'apiId' | 'disciplineId' | 'creditLock'>[] = [
  // Semester 1
  { id: 'IME0310814', code: 'IME03-10814', semester: 1, row: 1 },
  { id: 'IME0104827', code: 'IME01-04827', semester: 1, row: 2 },
  { id: 'IME0210815', code: 'IME02-10815', semester: 1, row: 3 },
  { id: 'IME0610816', code: 'IME06-10816', semester: 1, row: 4 },
  { id: 'IME0410817', code: 'IME04-10817', semester: 1, row: 5 },
  // Semester 2
  { id: 'IME0210818', code: 'IME02-10818', semester: 2, row: 1 },
  { id: 'IME0106766', code: 'IME01-06766', semester: 2, row: 2 },
  { id: 'IME0510819', code: 'IME05-10819', semester: 2, row: 3 },
  { id: 'IME0410820', code: 'IME04-10820', semester: 2, row: 4 },
  { id: 'IME0410821', code: 'IME04-10821', semester: 2, row: 5 },
  { id: 'FIS0110982', code: 'FIS01-10982', semester: 2, row: 6 },
  // Semester 3
  { id: 'ILE0210822', code: 'ILE02-10822', semester: 3, row: 1 },
  { id: 'IME0106767', code: 'IME01-06767', semester: 3, row: 2 },
  { id: 'IME0410823', code: 'IME04-10823', semester: 3, row: 3 },
  { id: 'IME0210824', code: 'IME02-10824', semester: 3, row: 4 },
  { id: 'IME0410825', code: 'IME04-10825', semester: 3, row: 5 },
  { id: 'IME0410826', code: 'IME04-10826', semester: 3, row: 6 },
  // Semester 4
  { id: 'IME0610827', code: 'IME06-10827', semester: 4, row: 1 },
  { id: 'IME0110828', code: 'IME01-10828', semester: 4, row: 2 },
  { id: 'IME0411311', code: 'IME04-11311', semester: 4, row: 3 },
  { id: 'IME0410830', code: 'IME04-10830', semester: 4, row: 4 },
  { id: 'IME0410831', code: 'IME04-10831', semester: 4, row: 5 },
  { id: 'FIS0310983', code: 'FIS03-10983', semester: 4, row: 6 },
  // Semester 5
  { id: 'IME0410834', code: 'IME04-10834', semester: 5, row: 1 },
  { id: 'IME0410832', code: 'IME04-10832', semester: 5, row: 2 },
  { id: 'IME0411312', code: 'IME04-11312', semester: 5, row: 3 },
  { id: 'IME0410833', code: 'IME04-10833', semester: 5, row: 4 },
  { id: 'IME0410835', code: 'IME04-10835', semester: 5, row: 5 },
  { id: 'IME0410836', code: 'IME04-10836', semester: 5, row: 6 },
  { id: 'ELETIVABASICA', code: 'Eletiva', name: 'Eletiva Básica', semester: 5, row: 7, isElectiveGroup: true },
  // Semester 6
  { id: 'IME0610837', code: 'IME06-10837', semester: 6, row: 1 },
  { id: 'IME0410838', code: 'IME04-10838', semester: 6, row: 2 },
  { id: 'IME0410839', code: 'IME04-10839', semester: 6, row: 3 },
  { id: 'ELETIVAI', code: 'Eletiva', name: 'Eletiva I', semester: 6, row: 4, isElectiveGroup: true },
  { id: 'IME0410840', code: 'IME04-10840', semester: 6, row: 5 },
  { id: 'IME0410841', code: 'IME04-10841', semester: 6, row: 6 },
  // Semester 7
  { id: 'IME0410842', code: 'IME04-10842', semester: 7, row: 1 },
  { id: 'IME0410843', code: 'IME04-10843', semester: 7, row: 2 },
  { id: 'IME0410844', code: 'IME04-10844', semester: 7, row: 3 },
  { id: 'IME0410845', code: 'IME04-10845', semester: 7, row: 4 },
  { id: 'IME0410846', code: 'IME04-10846', semester: 7, row: 5 },
  { id: 'IME0410847', code: 'IME04-10847', semester: 7, row: 6 },
  // Semester 8
  { id: 'ELETIVAII', code: 'Eletiva', name: 'Eletiva II', semester: 8, row: 1, isElectiveGroup: true },
  { id: 'ELETIVAIII', code: 'Eletiva', name: 'Eletiva III', semester: 8, row: 2, isElectiveGroup: true },
  { id: 'IME0410848', code: 'IME04-10848', semester: 8, row: 3 },
  { id: 'IME0410849', code: 'IME04-10849', semester: 8, row: 4 },
  { id: 'ELETIVAIV', code: 'Eletiva', name: 'Eletiva IV', semester: 8, row: 5, isElectiveGroup: true },
];

function getCategory(type: string): CourseCategory {
    if (type === 'Obrigatória') {
        return 'Obrigatória';
    }
    if (type === 'E. Restrita' || type === 'Optativa') {
        return 'Eletiva';
    }
    return 'Unknown';
}

function extractCourseCodeFromName(name: string): string {
    const match = name.match(/^([A-Z]{2,5}\d{1,2}-?\d{4,})\s/);
    if (match) return match[1];
    
    const fallbackMatch = name.match(/^([A-Z]{2,5}-\d{2,7})\s/);
    if(fallbackMatch) return fallbackMatch[1];
    
    return name.split(' ')[0] || name;
}


export async function getCourses(): Promise<{ courses: Course[], semesters: number[], idMapping: CourseIdMapping }> {
  try {
    const response = await fetch('https://ccomp-uerj-progress-backend.onrender.com/disciplines');
    if (!response.ok) {
      throw new Error('Falha ao buscar os cursos');
    }
    const apiCourses: ApiCourse[] = await response.json();
    
    const codeToIdMap = new Map<string, string>();
    const allCoursesMap = new Map<string, ApiCourse>();
    const idMapping: CourseIdMapping = {};

    apiCourses.forEach(apiCourse => {
      const rawCode = extractCourseCodeFromName(apiCourse.name);
      const id = rawCode.replace(/[^A-Z0-9]/g, '');
      codeToIdMap.set(rawCode, id);
      allCoursesMap.set(id, apiCourse);
      
      idMapping[id] = apiCourse.disciplineId;
    });
    
    const electiveCourses = apiCourses
      .filter(c => c.type === 'E. Restrita' || c.type === 'Optativa')
      .map(apiCourse => {
          const rawCode = extractCourseCodeFromName(apiCourse.name);
          const name = apiCourse.name.replace(rawCode, '').trim();
          const id = rawCode.replace(/[^A-Z0-9]/g, '');
          return {
            id,
            apiId: apiCourse._id,
            disciplineId: apiCourse.disciplineId,
            code: rawCode,
            name,
            semester: 0, // Not placed in a semester by default
            credits: apiCourse.credits,
            creditLock: parseInt(apiCourse.creditLock) || 0,
            dependencies: [],
            category: getCategory(apiCourse.type),
            row: 0,
          }
      });

    const basicElectives = electiveCourses.filter(c => !c.code.startsWith('IME'));
    const groupIIElectives = electiveCourses.filter(c => c.code.startsWith('IME'));

    const finalCourses: Course[] = FLOWCHART_LAYOUT.map(layoutCourse => {
      if (layoutCourse.isElectiveGroup) {
        let electives: Course[] = [];
        if (layoutCourse.id === 'ELETIVABASICA') electives = basicElectives;
        if (['ELETIVAI', 'ELETIVAII', 'ELETIVAIII', 'ELETIVAIV'].includes(layoutCourse.id)) electives = groupIIElectives;

        return {
          ...layoutCourse,
          apiId: layoutCourse.id, // group id
          disciplineId: layoutCourse.id,
          name: layoutCourse.name || 'Eletiva',
          credits: 4, // Placeholder credits
          creditLock: 0,
          dependencies: [],
          category: 'Eletiva',
          electives: electives
        };
      }

      const apiCourse = allCoursesMap.get(layoutCourse.id);

      if (!apiCourse) {
        return {
          ...layoutCourse,
          apiId: '',
          disciplineId: '',
          name: `N/A: ${layoutCourse.code}`,
          credits: 0,
          creditLock: 0,
          dependencies: [],
          category: 'Unknown',
        };
      }
      
      const name = apiCourse.name.replace(layoutCourse.code, '').trim();

      const dependencies = (apiCourse.requirements ?? [])
        .filter(req => req.type === 'Pré-Requisito')
        .flatMap(req => {
          const descs = req.description.split(/\s+ou\s+/);
          return descs.map(desc => {
            const reqCode = extractCourseCodeFromName(desc.trim());
            const reqId = codeToIdMap.get(reqCode);
            return reqId;
          });
        })
        .filter(Boolean) as string[];

      return {
        ...layoutCourse,
        apiId: apiCourse._id,
        disciplineId: apiCourse.disciplineId,
        name: name,
        credits: apiCourse.credits,
        creditLock: parseInt(apiCourse.creditLock) || 0,
        dependencies: Array.from(new Set(dependencies)),
        category: getCategory(apiCourse.type),
      };
    });

    const semesters = Array.from(new Set(finalCourses.map(c => c.semester))).sort((a, b) => a - b);

    return { courses: finalCourses, semesters, idMapping };
  } catch (error) {
    console.error("Erro ao buscar ou processar dados dos cursos:", error);
    return { courses: [], semesters: [], idMapping: {} };
  }
}
