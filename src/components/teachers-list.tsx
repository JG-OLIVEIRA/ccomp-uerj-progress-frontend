
"use client";

import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Search, Book } from 'lucide-react';
import type { Teacher } from '@/app/teachers/page';

type TeachersListProps = {
  initialTeachers: Teacher[];
};

export function TeachersList({ initialTeachers }: TeachersListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) {
      return initialTeachers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return initialTeachers.filter(teacher =>
      teacher.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [initialTeachers, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Professores</CardTitle>
        <CardDescription>
          Visualize todos os professores e as disciplinas que eles lecionam.
        </CardDescription>
        <div className="relative pt-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome..."
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
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Nº de Disciplinas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <TableRow key={teacher.teacherId}>
                    <TableCell className="font-medium capitalize">
                      {teacher.name.toLowerCase()}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Book className="h-4 w-4 text-muted-foreground"/>
                         <span>{teacher.disciplines.length}</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Nenhum professor encontrado.
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
