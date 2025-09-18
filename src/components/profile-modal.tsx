
"use client";

import { useState, useContext, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StudentContext } from '@/contexts/student-context';
import { updateStudentProfile } from '@/lib/student';

const profileSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { student, fetchStudentData } = useContext(StudentContext)!;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      lastName: '',
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        lastName: student.lastName,
      });
    }
  }, [student, reset, isOpen]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!student) return;

    setIsSubmitting(true);
    try {
      await updateStudentProfile(student.studentId, data);
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
      // Re-fetch student data to update the UI
      await fetchStudentData(student.studentId);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                  className="w-full"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Sobrenome
              </Label>
              <div className="col-span-3">
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="w-full"
                />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
