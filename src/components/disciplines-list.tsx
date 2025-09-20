
"use client";

import { useState, useMemo } from 'react';
import type { Course } from '@/lib/courses';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Search } from 'lucide-react';
import { Badge } from './ui/badge';

type DisciplinesListProps = {
  initialDisciplines: Course[];
};

export function DisciplinesList({ initialDisciplines }: DisciplinesListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedDisciplines = useMemo(() => {
    return [...initialDisciplines].sort((a, b) => {
        if (a.semester !== b.semester) {
            return (a.semester || 99) - (b.semester || 99);
        }
        return a.name.localeCompare(b.name);
    });
  }, [initialDisciplines]);

  const filteredDisciplines = useMemo(() => {
    if (!searchTerm) {
      return sortedDisciplines;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return sortedDisciplines.filter(discipline =>
      discipline.name.toLowerCase().includes(lowercasedTerm) ||
      discipline.code.toLowerCase().includes(lowercasedTerm)
    );
  }, [sortedDisciplines, searchTerm]);

  return (
    <>
        <div className="relative px-6 pb-4">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-1/3"
            />
        </div>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Período Sugerido</TableHead>
                <TableHead className="text-center">Créditos</TableHead>
                <TableHead className="text-right">Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisciplines.length > 0 ? (
                filteredDisciplines.map(discipline => (
                  <TableRow key={discipline.id}>
                    <TableCell className="font-mono">{discipline.code}</TableCell>
                    <TableCell>{discipline.name}</TableCell>
                    <TableCell className="text-center">
                        {discipline.semester ? `${discipline.semester}º` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">{discipline.credits}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={discipline.category === 'Obrigatória' ? 'default' : 'secondary'}>
                            {discipline.category}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma disciplina encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </>
  );
}
