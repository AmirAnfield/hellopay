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
} from '@/components/ui/dialog'
import { FileDown, Eye, Trash2 } from 'lucide-react'

interface ContractListProps {
  contracts: Array<{
    id: string
    employerName: string
    employeeName: string
    employeePosition: string
    contractType: string
    startDate: string | Date
    endDate?: string | Date | null
    salary: number
    pdfUrl: string
    createdAt: string | Date
  }>
  onDelete: (id: string) => void
}

export function ContractList({ contracts, onDelete }: ContractListProps) {
  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<string | null>(null)

  const handleViewClick = (contract: typeof contracts[0]) => {
    setSelectedContract(contract)
  }

  const handleDownloadClick = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank')
  }

  const handleDeleteClick = (id: string) => {
    setContractToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (contractToDelete) {
      onDelete(contractToDelete)
      setShowDeleteDialog(false)
      setContractToDelete(null)
    }
  }

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getContractTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'TempsPartiel': 'Temps partiel',
      'TempsComplet': 'Temps complet'
    }
    return types[type] || type
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(salary)
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Aucun contrat disponible
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
              <TableHead>Poste</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Salaire</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">
                  {formatDate(contract.createdAt)}
                </TableCell>
                <TableCell>{contract.employeeName}</TableCell>
                <TableCell>{contract.employeePosition}</TableCell>
                <TableCell>{getContractTypeLabel(contract.contractType)}</TableCell>
                <TableCell>
                  {formatDate(contract.startDate)}
                  {contract.endDate ? ` - ${formatDate(contract.endDate)}` : ''}
                </TableCell>
                <TableCell>{formatSalary(contract.salary)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewClick(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadClick(contract.pdfUrl)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(contract.id)}
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
            Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.
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

      {/* Dialogue d'affichage du contrat */}
      <Dialog 
        open={selectedContract !== null} 
        onOpenChange={() => setSelectedContract(null)}
      >
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Contrat de {selectedContract?.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedContract && (
              <iframe
                src={selectedContract.pdfUrl}
                className="w-full h-[65vh]"
                title={`Contrat de ${selectedContract.employeeName}`}
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => selectedContract && handleDownloadClick(selectedContract.pdfUrl)}
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