'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../components/ui/dialog'
import { FileDown, Eye, Trash2 } from 'lucide-react'

interface CertificateListProps {
  certificates: Array<{
    id: string
    employerName: string
    employeeName: string
    employeePosition: string
    certificateType: string
    startDate: string | Date
    endDate?: string | Date | null
    issuedDate: string | Date
    issuedLocation: string
    pdfUrl: string
    createdAt: string | Date
  }>
  onDelete: (id: string) => void
}

export function CertificateList({ certificates, onDelete }: CertificateListProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<typeof certificates[0] | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null)

  const handleViewClick = (certificate: typeof certificates[0]) => {
    setSelectedCertificate(certificate)
  }

  const handleDownloadClick = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank')
  }

  const handleDeleteClick = (id: string) => {
    setCertificateToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (certificateToDelete) {
      onDelete(certificateToDelete)
      setShowDeleteDialog(false)
      setCertificateToDelete(null)
    }
  }

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getCertificateTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'Emploi': 'Attestation d\'emploi',
      'Travail': 'Certificat de travail',
      'FinContrat': 'Attestation de fin de contrat'
    }
    return types[type] || type
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Aucune attestation disponible
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employé</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Émission</TableHead>
              <TableHead>Période</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell className="font-medium">
                  {formatDate(certificate.createdAt)}
                </TableCell>
                <TableCell>{certificate.employeeName}</TableCell>
                <TableCell>{getCertificateTypeLabel(certificate.certificateType)}</TableCell>
                <TableCell>
                  {formatDate(certificate.issuedDate)}, {certificate.issuedLocation}
                </TableCell>
                <TableCell>
                  {formatDate(certificate.startDate)}
                  {certificate.endDate ? ` - ${formatDate(certificate.endDate)}` : ''}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewClick(certificate)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadClick(certificate.pdfUrl)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(certificate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer cette attestation ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'affichage de l'attestation */}
      <Dialog 
        open={selectedCertificate !== null} 
        onOpenChange={() => setSelectedCertificate(null)}
      >
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedCertificate && getCertificateTypeLabel(selectedCertificate.certificateType)} de {selectedCertificate?.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedCertificate && (
              <iframe
                src={selectedCertificate.pdfUrl}
                className="w-full h-[65vh]"
                title={`Attestation de ${selectedCertificate.employeeName}`}
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => selectedCertificate && handleDownloadClick(selectedCertificate.pdfUrl)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 