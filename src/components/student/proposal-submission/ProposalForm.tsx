
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProposalFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  teamName: string;
  setTeamName: (teamName: string) => void;
  companyName: string;
  setCompanyName: (companyName: string) => void;
  isEditMode: boolean;
  existingTeamId: string | null;
  onNext: () => void;
  onCancel: () => void;
}

const ProposalForm = ({
  title,
  setTitle,
  description,
  setDescription,
  teamName,
  setTeamName,
  companyName,
  setCompanyName,
  isEditMode,
  existingTeamId,
  onNext,
  onCancel
}: ProposalFormProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Revisi Informasi Proposal' : 'Informasi Proposal'}</CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Perbaiki informasi proposal kerja praktik yang akan direvisi' 
            : 'Masukkan informasi proposal kerja praktik yang akan diajukan'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Proposal <span className="text-red-500">*</span></Label>
          <Input 
            id="title" 
            placeholder="Masukkan judul proposal" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi <span className="text-red-500">*</span></Label>
          <Textarea 
            id="description" 
            placeholder="Jelaskan singkat tentang proposal KP Anda"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Nama Perusahaan/Instansi <span className="text-red-500">*</span></Label>
          <Input 
            id="companyName" 
            placeholder="Masukkan nama perusahaan/instansi" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teamName">Nama Tim <span className="text-red-500">*</span></Label>
          <Input 
            id="teamName" 
            placeholder="Masukkan nama tim KP" 
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isEditMode && existingTeamId !== null}
          />
          {isEditMode && existingTeamId !== null && (
            <p className="text-xs text-muted-foreground">Nama tim tidak dapat diubah dalam mode revisi</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button 
          onClick={onNext}
          className="bg-primary hover:bg-primary/90"
        >
          Selanjutnya
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProposalForm;
