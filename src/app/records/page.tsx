
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, FilePlus, Trash2, Download, Eye } from "lucide-react";
import { SmartTaggingForm } from "@/components/features/smart-tagging-form";

export default function DigitalRecordsPage() {
  const documents = [
    { id: "doc001", name: "Rabies Vaccination Certificate", type: "Vaccination Card", date: "2023-05-10", tags: ["vaccination", "rabies", "Fluffy"] },
    { id: "doc002", name: "Vet Bill - Annual Checkup", type: "Bill", date: "2024-01-15", tags: ["vet bill", "checkup", "Max"] },
    { id: "doc003", name: "Health Record Summary", type: "Health Record", date: "2024-03-20", tags: ["health", "summary", "Fluffy"] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-lg text-muted-foreground md:max-w-2xl">Centralized storage for your pet's important documents. Upload, organize, and safely store bills, vet receipts, vaccination cards, and health records.</p>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl sm:text-2xl">My Pet Documents</CardTitle>
                </div>
                <Button variant="outline" size="sm"><FilePlus className="mr-2 h-4 w-4" /> Add Filter</Button>
              </div>
              <CardDescription>
                All your uploaded pet documents. Click to view or manage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Download"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {documents.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No documents uploaded yet. Start by uploading your pet's records!</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <SmartTaggingForm />
        </div>
      </div>
    </div>
  );
}
