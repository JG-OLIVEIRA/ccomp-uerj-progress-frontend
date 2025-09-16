
"use client";

import { useEffect, useState, useContext } from 'react';
import type { Course } from '@/lib/courses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { StudentContext, CourseStatus } from '@/contexts/student-context';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Link, Lock } from 'lucide-react';

type CourseDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  allCourses: Course[];
  totalCredits: number;
};

type ApiClassDetail = {
  number: number;
  teacher: string;
  times: string;
  whatsappGroup?: string;
};

type ApiDisciplineDetail = {
  _id: string;
  name: string;
  credits: number;
  disciplineId: string;
  classes: ApiClassDetail[];
};

function normalizeTeacherName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeClassTimes(times: string): string {
    if (!times || typeof times !== 'string') return '';
    const dayMapping: Record<string, string> = {
        'SEG': 'Seg', 'TER': 'Ter', 'QUA': 'Qua', 'QUI': 'Qui', 'SEX': 'Sex', 'SAB': 'Sáb'
    };
    // This regex finds day abbreviations followed by time slots
    const regex = /(SEG|TER|QUA|QUI|SEX|SAB)((\s+[A-Z0-9]+)+)/g;
    return times.replace(regex, (match, day, timeSlots) => {
        const normalizedDay = dayMapping[day] || day;
        return ` / ${normalizedDay}${timeSlots}`;
    }).slice(3); // Remove the leading ' / '
}


export function CourseDetailModal({ isOpen, onClose, course, allCourses, totalCredits }: CourseDetailModalProps) {
  const [details, setDetails] = useState<ApiDisciplineDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { student, courseStatuses, updateCourseStatus } = useContext(StudentContext)!;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const [whatsappLinks, setWhatsappLinks] = useState<Record<number, string>>({});

  const currentStatus = courseStatuses[course.id] || 'NOT_TAKEN';
  
  const dependencies = course.dependencies
    .map(depId => allCourses.find(c => c.id === depId))
    .filter(Boolean) as Course[];
  
  const areDependenciesMet = dependencies.every(dep => courseStatuses[dep.id] === 'COMPLETED');
  const areCreditsMet = course.creditLock === 0 || totalCredits >= course.creditLock;
  const canTakeCourse = !student || (areDependenciesMet && areCreditsMet);

  const fetchDetails = async (signal?: AbortSignal) => {
    if (!course.disciplineId || course.isElectiveGroup) return;

    setIsLoadingDetails(true);
    setError(null);
    try {
      const response = await fetch(`/api/disciplines/${course.disciplineId}`, { signal });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Falha ao buscar os detalhes da disciplina');
      }
      const data: ApiDisciplineDetail = await response.json();
      setDetails(data);
      
      const initialLinks: Record<number, string> = {};
      data.classes?.forEach(cls => {
        if(cls.whatsappGroup) {
          initialLinks[cls.number] = cls.whatsappGroup;
        }
      });
      setWhatsappLinks(initialLinks);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoadingDetails(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setDetails(null);
      setError(null);
      setIsLoadingDetails(false);
      setWhatsappLinks({});
      return;
    }

    const controller = new AbortController();
    fetchDetails(controller.signal);

    return () => {
      controller.abort();
    };
  }, [isOpen, course.disciplineId, course.isElectiveGroup]);

  const handleWhatsappLinkChange = (classNumber: number, value: string) => {
    setWhatsappLinks(prev => ({...prev, [classNumber]: value}));
  }

  const handleWhatsappLinkSubmit = async (classNumber: number) => {
    const link = whatsappLinks[classNumber];
    if(!link || !course.disciplineId) return;

    try {
      const response = await fetch(`/api/disciplines/${course.disciplineId}/classes/${classNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappGroup: link })
      });

      if(!response.ok) {
        throw new Error('Falha ao salvar o link do WhatsApp.');
      }
      toast({
        title: 'Sucesso!',
        description: `Link do WhatsApp para a Turma ${classNumber} salvo.`
      });
      // Re-fetch details to show updated data
      fetchDetails();
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Ocorreu um erro.',
        variant: 'destructive'
      });
    }
  }

  const handleStatusChange = async (newStatus: CourseStatus) => {
    if (!student) {
      toast({
        title: "Ação necessária",
        description: "Você precisa estar logado para alterar o status de uma disciplina.",
        variant: "destructive"
      });
      return;
    }
    if (course.isElectiveGroup) return;

    if (newStatus !== 'NOT_TAKEN' && !canTakeCourse) {
      let description = "Você precisa concluir todos os pré-requisitos antes de cursar esta disciplina.";
      if (!areDependenciesMet) {
        description = "Você precisa concluir todas as disciplinas de pré-requisito antes de cursar esta.";
      } else if (!areCreditsMet) {
        description = `Você precisa de pelo menos ${course.creditLock} créditos concluídos para cursar esta disciplina. Você tem ${totalCredits}.`;
      }
      toast({
        title: "Pré-requisitos não cumpridos",
        description,
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateCourseStatus(course, newStatus, currentStatus, allCourses);
      toast({
        title: "Sucesso!",
        description: `Status de "${course.name}" atualizado.`,
      });
      onClose(); // Close modal on success
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o status da disciplina.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
          <DialogDescription>
            {course.code} &middot; {course.credits} Créditos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Categoria</h4>
            <Badge variant="secondary">{course.category}</Badge>
          </div>

          {(dependencies.length > 0 || course.creditLock > 0) && <Separator className="my-3" />}

          {dependencies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Pré-requisitos (Disciplinas)</h4>
              <div className="flex flex-wrap gap-2">
                {dependencies.map(dep => {
                    const depStatus = courseStatuses[dep.id];
                    const isCompleted = depStatus === 'COMPLETED';
                    return (
                        <Badge key={dep.id} variant={isCompleted ? 'default' : 'destructive'}>{dep.name}</Badge>
                    )
                })}
              </div>
            </div>
          )}
          
          {course.creditLock > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Pré-requisitos (Créditos)</h4>
                <Badge variant={areCreditsMet ? 'default' : 'destructive'}>
                    <Lock className="mr-2 h-3 w-3" />
                    Requer {course.creditLock} créditos. Você tem {totalCredits}.
                </Badge>
            </div>
          )}


          <Separator className="my-3" />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Turmas e Professores</h4>
            {isLoadingDetails && (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {details && details.classes && details.classes.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {details.classes.map((cls) => (
                        <AccordionItem value={`turma-${cls.number}`} key={cls.number}>
                            <AccordionTrigger>Turma {cls.number}</AccordionTrigger>
                            <AccordionContent>
                                <div className="text-sm space-y-3">
                                    <p><span className="font-semibold">Professor(a):</span> {normalizeTeacherName(cls.teacher)}</p>
                                    <p><span className="font-semibold">Horários:</span> {normalizeClassTimes(cls.times)}</p>
                                    {cls.whatsappGroup ? (
                                      <div className='flex items-center gap-2'>
                                        <Link className='h-4 w-4'/>
                                        <a href={cls.whatsappGroup} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                          Acessar grupo do WhatsApp
                                        </a>
                                      </div>
                                    ) : (
                                       <p className="text-xs text-muted-foreground">Nenhum grupo de WhatsApp cadastrado.</p>
                                    )}
                                    <div className="flex gap-2 items-center pt-2">
                                      <Input 
                                        type="url"
                                        placeholder="Cole o link do grupo de WhatsApp aqui"
                                        value={whatsappLinks[cls.number] || ''}
                                        onChange={(e) => handleWhatsappLinkChange(cls.number, e.target.value)}
                                        className="h-8 text-xs"
                                      />
                                      <Button size="sm" className="h-8" onClick={() => handleWhatsappLinkSubmit(cls.number)}>Salvar</Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                !isLoadingDetails && !error && <p className="text-sm text-muted-foreground">Nenhuma turma disponível para esta disciplina.</p>
            )}
            </div>
        </div>
        {student && !course.isElectiveGroup && (
          <DialogFooter className="pt-4 border-t">
            <div className="flex justify-end gap-2 w-full">
              <Button 
                size="sm" 
                variant={currentStatus === 'COMPLETED' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdatingStatus || currentStatus === 'COMPLETED'}
              >
                Concluída
              </Button>
              <Button 
                size="sm" 
                variant={currentStatus === 'CURRENT' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('CURRENT')}
                disabled={isUpdatingStatus || currentStatus === 'CURRENT' || !canTakeCourse}
                title={!canTakeCourse ? "Cumpra os pré-requisitos para cursar" : ""}
              >
                Cursando
              </Button>
              <Button 
                size="sm" 
                variant={currentStatus === 'NOT_TAKEN' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('NOT_TAKEN')}
                disabled={isUpdatingStatus || currentStatus === 'NOT_TAKEN'}
              >
                Não Cursada
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
