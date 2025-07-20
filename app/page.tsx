"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, X } from "lucide-react";
import Papa from "papaparse";

export default function Component() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sumModalOpen, setSumModalOpen] = useState(false);
  const [sumValue, setSumValue] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv")
    );

    if (csvFile) {
      setSelectedFile(csvFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
        setSelectedFile(file);
      }
    },
    []
  );

  const handleUpload = () => {
    // Empty function for now - this is where you'll add your upload logic
    console.log("Upload function called with file:", selectedFile?.name);
    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          console.log("Parsed CSV data:", results.data);
          // Sum the column titled "Invoice Amount" after parsing
          if (results && Array.isArray(results.data)) {
            const sum = results.data.reduce((acc: number, row: any) => {
              // Try to parse the value as a float, default to 0 if not a number
              const value = parseFloat(row["Invoice Amount"] ?? 0);
              return acc + (isNaN(value) ? 0 : value);
            }, 0);
            setSumModalOpen(true);
            setSumValue(sum);
            setSelectedFile(null);
          }
        },
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const closeSumModal = () => {
    setSumModalOpen(false);
    setSumValue(0);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            VendorCafe Invoice Amount Owed{" "}
          </CardTitle>
          <CardDescription>
            Drag and drop your Pending Invoices CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    Drop your CSV file here, or{" "}
                    <label className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Only CSV files are supported
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-full"
          >
            Calculate Invoice Amount Owed
          </Button>
        </CardContent>
      </Card>

      <Dialog open={sumModalOpen} onOpenChange={closeSumModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Invoice Summary
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-lg text-gray-700 mb-2">Total amount owed</p>
            <p className="text-3xl font-bold text-green-600">
              $
              {sumValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
