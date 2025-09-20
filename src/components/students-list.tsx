
"use client";

import { useState, useMemo } from 'react';
import type { Student } from '@/lib/student';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Search } from 'lucide-react';

type StudentsListProps = {
  initialStudents: Student[];
};

export function StudentsList({ initialStudents }: StudentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return initialStudents;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return initialStudents.filter(student =>
      student.name.toLowerCase().includes(lowercasedTerm) ||
      student.lastName.toLowerCase().includes(lowercasedTerm) ||
      student.studentId.includes(lowercasedTerm)
    );
  }, [initialStudents, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Estudantes</CardTitle>
        <CardDescription>
          Visualize todos os estudantes cadastrados e seus créditos.
        </CardDescription>
        <div className="relative pt-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-1/3"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Créd. Obrigatórios</TableHead>
                <TableHead className="text-center">Créd. Eletivos</TableHead>
                <TableHead className="text-right font-bold">Créd. Totais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-mono">{student.studentId}</TableCell>
                    <TableCell>{`${student.name} ${student.lastName}`}</TableCell>
                    <TableCell className="text-center">{student.mandatoryCredits}</TableCell>
                    <TableCell className="text-center">{student.electiveCredits}</TableCell>
                    <TableCell className="text-right font-bold">
                      {student.mandatoryCredits + student.electiveCredits}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum estudante encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
