
"use client";

import { useState, useContext } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { StudentContext } from '@/contexts/student-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User, LogOut, Edit } from 'lucide-react';
import { ProfileModal } from './profile-modal';

export function StudentLogin() {
    const [studentId, setStudentId] = useState('');
    const { student, fetchStudentData, isLoading, logout } = useContext(StudentContext)!;
    const { toast } = useToast();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const matriculaRegex = /^\d{12}$/;
        if (!studentId || !matriculaRegex.test(studentId)) {
            toast({
                title: 'Matrícula Inválida',
                description: 'Por favor, insira uma matrícula válida com 12 dígitos.',
                variant: 'destructive',
            });
            return;
        }
        await fetchStudentData(studentId);
    };

    if (student) {
        const initials = (student.name?.[0] ?? '') + (student.lastName?.[0] ?? '');
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {initials.toUpperCase() || <User />}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{student.name} {student.lastName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {student.studentId}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            </>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Input 
                placeholder="Sua matrícula..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isLoading}
                className="h-9"
            />
            <Button type="submit" disabled={isLoading} size="sm">
                {isLoading ? 'Carregando...' : 'Acessar'}
            </Button>
        </form>
    )
}
