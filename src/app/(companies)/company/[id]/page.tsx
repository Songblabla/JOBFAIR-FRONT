"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Company } from "@/types/company";
import { User } from "@/types/user";

const CompanyPage = ({ params }: { params: { id: string } }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await api.get<{ data: Company }>(
        `companies/${companyId}`
      );
      setCompany(response.data.data);
      setEditedCompany(response.data.data);
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get(`auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response?.data) {
        setUserData(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch user data. Please try again.");
      console.error("Error get me:", error);
    }
  };

  const handleUpdateCompany = async () => {
    if (!editedCompany) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      if (!company) {
        toast.error("Company data is not available.");
        return;
      }
      await api.put(`companies/${company._id}`, editedCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompany(editedCompany);
      toast.success("Company updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company. Please try again.");
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;
    try {
      await api.delete(`companies/${company._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Company deleted successfully!");
      router.push("/companies");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {company ? (
        <Card
          key={company._id}
          className="w-full dark:bg-neutral-800 shadow-lg"
        >
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center">
            {company.picture && (
              <div className="md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-8 max-w-xs flex justify-center items-center">
                <Image
                  src={company.picture}
                  alt={`${company.name} logo`}
                  className="h-auto object-contain rounded-lg"
                  width={100}
                  height={100}
                />
              </div>
            )}
            <div className="w-full md:w-2/3">
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {company.name}
                </h2>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Business:</strong> {company.business}
                </p>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Address:</strong> {company.address},{" "}
                  {company.postalcode}
                </p>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Phone:</strong> {company.tel}
                </p>
              </div>
            </div>
            {userData?.role === "admin" && (
              <div className="mt-4 md:mt-0 md:ml-4 flex flex-col md:flex-row">
                <Button
                  className="btn-primary"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="ml-4"
                  onClick={handleDeleteCompany}
                >
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the details below to modify the company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editedCompany &&
              Object.keys(editedCompany)
              .filter((key) => key !== 'id' && key !== '__v' && key !== '_id')
              .map((key) => (
                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                  <Label htmlFor={key} className="text-right">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <Input
                    id={key}
                    value={editedCompany[key as keyof Company] ?? ""}
                    onChange={(e) =>
                      setEditedCompany((prev) => ({
                        ...(prev as Company),
                        [key]: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateCompany}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyPage;
