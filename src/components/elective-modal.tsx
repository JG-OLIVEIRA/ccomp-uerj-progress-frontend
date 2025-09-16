"use client";

import type { Course } from '@/lib/courses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type ElectiveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  electiveGroup: Course;
  onElectiveSelect: (course: Course) => void;
};

export function ElectiveModal({ isOpen, onClose, electiveGroup, onElectiveSelect }: ElectiveModalProps) {
  if (!electiveGroup.electives) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{electiveGroup.name}</DialogTitle>
          <DialogDescription>
            Lista de disciplinas eletivas disponíveis. Clique em uma para ver os detalhes.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {electiveGroup.electives.map(course => (
                    <Card key={course.id} className="cursor-pointer hover:bg-accent" onClick={() => onElectiveSelect(course)}>
                        <CardHeader className='p-4 pb-2'>
                            <CardTitle className='text-sm font-semibold'>{course.name}</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4 pt-0'>
                            <p className="text-xs text-muted-foreground">{course.code} &middot; {course.credits} Créditos</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
