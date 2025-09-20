
"use client";

import { useEffect, useState, useMemo, useContext } from 'react';
import { StudentContext } from '@/contexts/student-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import type { Student } from '@/lib/student';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

type RankedStudent = {
    rank: number;
    studentId: string;
    name: string;
    totalCredits: number;
};

async function fetchAllStudents(): Promise<Student[]> {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) {
            console.error("Failed to fetch ranking data");
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return [];
    }
}

export function Ranking() {
    const { student } = useContext(StudentContext)!;
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!student) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);
        fetchAllStudents().then(data => {
            setAllStudents(data);
            setIsLoading(false);
        });
    }, [student]);

    const studentYear = useMemo(() => {
        if (!student?.studentId) return null;
        const match = student.studentId.match(/^\d{4}/);
        return match ? match[0] : null;
    }, [student?.studentId]);

    const rankedList = useMemo(() => {
        if (!student || !studentYear || allStudents.length === 0) return [];

        const yearRegex = new RegExp(`^${studentYear}`);

        const fullRankedList = allStudents
            .filter(s => s.studentId && yearRegex.test(s.studentId))
            .map(s => ({
                ...s,
                totalCredits: (s.mandatoryCredits || 0) + (s.electiveCredits || 0)
            }))
            .sort((a, b) => b.totalCredits - a.totalCredits)
            .map((s, index) => ({
                rank: index + 1,
                studentId: s.studentId,
                name: `${s.name} ${s.lastName}`,
                totalCredits: s.totalCredits,
            }));
        
        const top5 = fullRankedList.slice(0, 5);
        const currentUserInList = top5.find(s => s.studentId === student.studentId);

        if (currentUserInList) {
            return top5;
        }

        const currentUserRank = fullRankedList.find(s => s.studentId === student.studentId);
        if (currentUserRank && fullRankedList.length > 5) {
            return [...top5, { rank: -1, studentId: 'separator', name: '...', totalCredits: -1 }, currentUserRank];
        }
        
        return top5;

    }, [student, studentYear, allStudents]);

    if (!student) {
        return null;
    }
    
    if (isLoading) {
        return <RankingSkeleton />;
    }

    if (rankedList.length === 0) {
        return (
             <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className='text-center'>
                    <CardTitle className="text-lg flex items-center justify-center gap-2">
                        <Trophy /> Ranking do Ano
                    </CardTitle>
                    <CardDescription>Ainda não há dados suficientes para gerar o ranking do seu ano.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className='text-center'>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                    <Trophy className="text-yellow-500" /> Ranking de {studentYear}
                </CardTitle>
                <CardDescription>Sua posição entre os estudantes que ingressaram no mesmo ano.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Posição</TableHead>
                            <TableHead>Aluno</TableHead>
                            <TableHead className="text-right">Créditos Totais</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankedList.map(rankedStudent => {
                            if(rankedStudent.rank === -1) {
                                return (
                                    <TableRow key="separator" className="hover:bg-transparent">
                                        <TableCell className="text-center py-2 font-bold">...</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                )
                            }
                            return (
                                <TableRow key={rankedStudent.studentId} className={cn(rankedStudent.studentId === student.studentId && "bg-primary/10")}>
                                    <TableCell className="font-medium text-center">{rankedStudent.rank}</TableCell>
                                    <TableCell>{rankedStudent.name}</TableCell>
                                    <TableCell className="text-right font-bold">{rankedStudent.totalCredits}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function RankingSkeleton() {
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className='text-center'>
                <Skeleton className="h-6 w-1/3 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
