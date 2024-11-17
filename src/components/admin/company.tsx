import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Search, Plus, Settings, Eye, Edit, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "@/lib/axios";
import { Company } from '@/types/company';

interface CompanyManagementProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ companies, setCompanies }) => {
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<Company, '_id'>>({
    name: '',
    address: '',
    business: '',
    province: '',
    postalcode: '',
    tel: '',
    picture: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');

  const router = useRouter();

  const filteredCompanies = companies.filter(company => {
    const name = (company.name || '').toLowerCase();
    const business = (company.business || '').toLowerCase();
    const searchTerm = companySearchTerm.toLowerCase();
    return name.includes(searchTerm) || business.includes(searchTerm);
  });

  const handleViewCompany = (id: string) => {
    router.push(`/company/${id}`);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleCreateCompany = async () => {
    try {
      const response = await api.post('companies', newCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies([...companies, response.data]);
      toast.success("Company created successfully!");
      setIsCreateCompanyDialogOpen(false);
      setNewCompany({
        name: '',
        address: '',
        business: '',
        province: '',
        postalcode: '',
        tel: '',
        picture: '',
      });
    } catch (error) {
      console.error("Error creating new company:", error);
      toast.error("Failed to create company. Please try again.");
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const response = await api.put(`companies/${editingCompany._id}`, editingCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies(companies.map(c => c._id === editingCompany._id ? response.data : c));
      toast.success("Company updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company. Please try again.");
    }
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };
  
  const processDeleteCompany = async () => {
    if (!companyToDelete || confirmationInput !== companyToDelete.name) {
      toast.error("Company name doesn't match. Deletion cancelled.");
      return;
    }
  
    try {
      await api.delete(`companies/${companyToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies(companies.filter(c => c._id !== companyToDelete._id));
      toast.success("Company deleted successfully!");
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      setConfirmationInput('');
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company. Please try again.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>Oversee and manage registered companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search companies..."
                className="pl-8 w-full"
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateCompanyDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </Button>
          </div>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.business}</TableCell>
                    <TableCell>{company.province}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Settings className="h-4 w-4"/> 
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCompany(company._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCompany(company)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the details below to modify the company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingCompany && Object.keys(editingCompany).map((key) => (
              key !== '_id' && key !== "__v" && key !== "id" && (
                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                  <Label htmlFor={key} className="text-right">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <Input
                    id={key}
                    value={editingCompany[key as keyof Company] ?? ''}
                    onChange={(e) =>
                      setEditingCompany((prev) => ({
                        ...(prev as Company),
                        [key]: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              )
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateCompany}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCompanyDialogOpen} onOpenChange={setIsCreateCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.keys(newCompany).map((key) => (
              <div className="grid grid-cols-4 items-center gap-4" key={key}>
                <Label htmlFor={key} className="text-right">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  id={key}
                  value={newCompany[key as keyof typeof newCompany]}
                  onChange={(e) =>
                    setNewCompany((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateCompany}>
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Company Deletion</DialogTitle>
            <DialogDescription>
              This is a destructive action and cannot be undone. To confirm deletion, please type the company name: <strong>{companyToDelete?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={processDeleteCompany}
              disabled={confirmationInput !== companyToDelete?.name}
            >
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyManagement;