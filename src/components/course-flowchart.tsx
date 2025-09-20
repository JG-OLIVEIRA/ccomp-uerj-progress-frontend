
"use client";

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import type { Course, CourseIdMapping } from '@/lib/courses';
import { CourseNode } from './course-node';
import { Card } from './ui/card';
import { ElectiveModal } from './elective-modal';
import { CourseDetailModal } from './course-detail-modal';
import { StudentContext } from '@/contexts/student-context';

type Line = {
  key: string;
  d: string;
};

type CourseFlowchartProps = {
  initialCourses: Course[];
  initialSemesters: number[];
  idMapping: CourseIdMapping;
};

export function CourseFlowchart({ initialCourses, initialSemesters, idMapping }: CourseFlowchartProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedElective, setSelectedElective] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { student, courseStatuses, setCourseIdMapping } = useContext(StudentContext)!;
  const [lockedCourses, setLockedCourses] = useState<Set<string>>(new Set());
  
  const totalCredits = student ? student.mandatoryCredits + student.electiveCredits : 0;

  useEffect(() => {
    setCourseIdMapping(idMapping);
  }, [idMapping, setCourseIdMapping]);


  const courses = initialCourses;
  const semesters = initialSemesters;

  useEffect(() => {
    if (!student) {
      setLockedCourses(new Set());
      return;
    }

    const newLockedCourses = new Set<string>();
    courses.forEach(course => {
      // Lock if dependencies are not met
      const areDependenciesMet = course.dependencies.every(depId => courseStatuses[depId] === 'COMPLETED');
      if (!areDependenciesMet) {
        newLockedCourses.add(course.id);
      }
      
      // Lock if credit lock is not met
      if (course.creditLock > 0 && totalCredits < course.creditLock) {
        newLockedCourses.add(course.id);
      }
    });
    setLockedCourses(newLockedCourses);
  }, [courseStatuses, courses, student, totalCredits]);


  const calculateLines = useCallback(() => {
    const newLines: Line[] = [];
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    courses.forEach(course => {
      if(course.isElectiveGroup) return;
      course.dependencies.forEach(depId => {
        const fromEl = document.getElementById(`node-${depId}`);
        const toEl = document.getElementById(`node-${course.id}`);

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          const x1 = fromRect.right - containerRect.left;
          const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
          const x2 = toRect.left - containerRect.left;
          const y2 = toRect.top + toRect.height / 2 - containerRect.top;
          
          const isDependencyInSameSemester = courses.find(c => c.id === depId)?.semester === course.semester;
          
          if(isDependencyInSameSemester){
             const d = `M ${x1} ${y1} C ${x1 + 10} ${y1}, ${x1 + 10} ${y1 - fromRect.height}, ${x1} ${y1 - fromRect.height} L ${x2} ${y2 + toRect.height} C ${x2-10} ${y2 + toRect.height}, ${x2-10} ${y2}, ${x2} ${y2}`;
             newLines.push({ key: `${depId}-${course.id}`, d });
          } else {
             const offset = Math.max(20, (x2 - x1) * 0.2);
             const d = `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
             newLines.push({ key: `${depId}-${course.id}`, d });
          }
        }
      });
    });

    setLines(newLines);
  }, [courses]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateLines();
    }, 150);

    window.addEventListener('resize', calculateLines);
    
    const observer = new MutationObserver(() => {
      calculateLines();
    });

    if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateLines);
      observer.disconnect();
    };
  }, [calculateLines]);

  const handleNodeClick = (course: Course) => {
    if (course.isElectiveGroup) {
      setSelectedElective(course);
    } else {
      setSelectedCourse(course);
    }
  }
  
  const handleElectiveSelect = (course: Course) => {
    setSelectedElective(null); // Close the elective modal
    setSelectedCourse(course); // Open the detail modal for the selected elective
  };


  if (!courses.length) {
    return (
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Falha ao carregar os dados dos cursos.</h2>
          <p className="text-muted-foreground mt-2">Por favor, tente atualizar a página.</p>
        </div>
      </Card>
    )
  }

  const gridCols = `grid-cols-8`; // Always 8 semesters
  const maxRow = Math.max(...courses.map(c => c.row), 0);

  return (
    <>
      <Card className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Fluxograma do Currículo</h2>
          <div className="flex flex-col justify-center items-center gap-4 mt-2">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma visualização interativa do currículo de Ciência da Computação. Clique nos cursos para ver detalhes e rastrear dependências.
            </p>
            {student && (
                <div className="text-sm font-medium text-white bg-primary/80 rounded-md px-3 py-1">
                    Créditos Totais: {totalCredits}
                </div>
            )}
          </div>
        </div>
        <div ref={containerRef} className="relative">
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" className="fill-current text-border" />
              </marker>
            </defs>
            {lines.map(line => (
              <path
                key={line.key}
                d={line.d}
                fill="none"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="stroke-current text-border transition-all"
              />
            ))}
          </svg>
          <div className={`grid ${gridCols} gap-x-2 items-start`}>
            {semesters.map(semester => (
              <div key={semester} className="flex flex-col items-center">
                <h3 className="text-base font-semibold text-muted-foreground mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-2 w-full text-center z-10">
                  {semester}º Período
                </h3>
                <div className="flex flex-col gap-y-2 h-full">
                  {Array.from({ length: maxRow }, (_, i) => i + 1).map(row => {
                    const course = courses.find(c => c.semester === semester && c.row === row);
                    const status = course ? courseStatuses[course.id] : undefined;
                    const isLocked = course ? lockedCourses.has(course.id) && status !== 'COMPLETED' : false;
                    return (
                      <div key={`${semester}-${row}`} className="h-[7.5rem] flex items-center justify-center" style={{ zIndex: 1 }}>
                        {course && <CourseNode course={course} onClick={() => handleNodeClick(course)} status={status} isLocked={isLocked} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      {selectedElective && (
        <ElectiveModal 
          isOpen={!!selectedElective} 
          onClose={() => setSelectedElective(null)}
          electiveGroup={selectedElective}
          onElectiveSelect={handleElectiveSelect}
        />
      )}
      {selectedCourse && (
        <CourseDetailModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          allCourses={courses}
          totalCredits={totalCredits}
        />
      )}
    </>
  );
}
