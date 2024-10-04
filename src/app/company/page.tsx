"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';

interface Company {
  _id: string;
  name: string;
  address: string;
  business: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get<{ data: Company[] }>('companies');
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-between min-h-screen relative">
        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Company Information
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground"
          >
            Discover the companies and their information.
          </motion.p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col gap-8 mb-16"
        >
          {companies.map((company) => (
            <Card key={company._id} className="w-full">
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center">
                {company.picture && (
                    <div className="md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-8 max-w-xs flex justify-center items-center">
                        <Image
                        src={company.picture}
                        alt={`${company.name} logo`}
                        className="h-auto object-contain"
                        width={100}
                        height={100}
                        />
                    </div>
                )}
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-semibold mb-4">{company.name}</h2>
                  <p className="text-muted-foreground mb-2">
                    <strong>Business:</strong> {company.business}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Address:</strong> {company.address}, {company.postalcode}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Phone:</strong> {company.tel}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <footer className="text-center text-muted-foreground text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
