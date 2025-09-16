
"use client";

import { useMemo, useContext } from 'react';
import type { Course } from '@/lib/courses';
import { StudentContext, type CourseStatus } from '@/contexts/student-context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const REQUIRED_MANDATORY_CREDITS = 177;
const REQUIRED_ELECTIVE_CREDITS = 20;

type RequirementsSummaryProps = {
  allCourses: Course[];
};

export function RequirementsSummary({ allCourses }: RequirementsSummaryProps) {
  const { student, courseStatuses } = useContext(StudentContext)!;

  const summary = useMemo(() => {
    let completedMandatory = 0;
    let completedElective = 0;

    allCourses.forEach(course => {
      if (courseStatuses[course.id] === 'COMPLETED' && !course.isElectiveGroup) {
        if (course.category === 'Obrigatória') {
          completedMandatory += course.credits;
        } else if (course.category === 'Eletiva') {
          completedElective += course.credits;
        }
      }
    });

    const remainingMandatory = Math.max(0, REQUIRED_MANDATORY_CREDITS - completedMandatory);
    const remainingElective = Math.max(0, REQUIRED_ELECTIVE_CREDITS - completedElective);

    return {
      mandatory: {
        completed: completedMandatory,
        remaining: remainingMandatory,
        total: REQUIRED_MANDATORY_CREDITS,
        status: remainingMandatory === 0 ? 'Completo' : 'Incompleto',
      },
      elective: {
        completed: completedElective,
        remaining: remainingElective,
        total: REQUIRED_ELECTIVE_CREDITS,
        status: remainingElective === 0 ? 'Completo' : 'Incompleto',
      },
    };
  }, [allCourses, courseStatuses]);

  if (!student) {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-lg text-center">Requisitos Curriculares da Titulação</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                Faça login para ver seu progresso de créditos.
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg text-center">Requisitos Curriculares da Titulação</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requisito</TableHead>
              <TableHead className="text-center">Cumprido</TableHead>
              <TableHead className="text-center">A Cumprir</TableHead>
              <TableHead className="text-right">Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">• Créditos em Disciplinas Obrigatórias</TableCell>
              <TableCell className="text-center">{summary.mandatory.completed}</TableCell>
              <TableCell className="text-center">{summary.mandatory.remaining}</TableCell>
              <TableCell className="text-right">
                <Badge variant={summary.mandatory.status === 'Completo' ? 'default' : 'destructive'}>
                  {summary.mandatory.status}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">• Créditos em Disciplinas Eletivas</TableCell>
              <TableCell className="text-center">{summary.elective.completed}</TableCell>
              <TableCell className="text-center">{summary.elective.remaining}</TableCell>
              <TableCell className="text-right">
                <Badge variant={summary.elective.status === 'Completo' ? 'default' : 'destructive'}>
                  {summary.elective.status}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
