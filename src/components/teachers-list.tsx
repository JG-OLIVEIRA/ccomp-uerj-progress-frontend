
"use client";

import { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Search, Book } from 'lucide-react';
import type { Teacher } from '@/app/teachers/page';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

type TeachersListProps = {
  initialTeachers: Teacher[];
  disciplineNames: Record<string, string>;
};

export function TeachersList({ initialTeachers, disciplineNames }: TeachersListProps) {
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
                        {teacher.disciplines.length > 0 ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center justify-end gap-2 w-full">
                                        <Book className="h-4 w-4 text-muted-foreground"/>
                                        <span>{teacher.disciplines.length}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Disciplinas Lecionadas</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Disciplinas associadas a este professor.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            {teacher.disciplines.map(discId => (
                                                <div key={discId} className="text-sm">
                                                    {disciplineNames[discId] || `Disciplina ${discId}`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                           <div className="flex items-center justify-end gap-2 text-muted-foreground">
                             <Book className="h-4 w-4"/>
                             <span>0</span>
                           </div>
                        )}
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
