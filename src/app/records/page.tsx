"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  FilePlus, 
  Trash2, 
  Download, 
  Eye, 
  ShieldCheck, 
  Search, 
  FileDigit, 
  Clock, 
  ArrowRight,
  Plus,
  MoreVertical,
  Filter
} from "lucide-react";
import { SmartTaggingForm } from "@/components/features/smart-tagging-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buttonTone, surfaceVariants } from "@/theme/variants";

const TH_LABEL = "text-overline md:text-label font-bold uppercase tracking-widest text-muted-foreground";

const INITIAL_DOCS = [
  { id: "doc001", name: "Rabies Vaccination Certificate", type: "Vaccination Card", date: "2023-05-10", tags: ["vaccination", "rabies", "Fluffy"], size: "1.2 MB" },
  { id: "doc002", name: "Vet Bill - Annual Checkup", type: "Bill", date: "2024-01-15", tags: ["vet bill", "checkup", "Max"], size: "0.8 MB" },
  { id: "doc003", name: "Health Record Summary", type: "Health Record", date: "2024-03-20", tags: ["health", "summary", "Fluffy"], size: "2.4 MB" },
];

export default function DigitalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const documents = INITIAL_DOCS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-foreground">Health Security Vault</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">A centralized, secure locker for all your pet's critical documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className={cn("rounded-card h-10 md:h-12 px-4 md:px-6 font-bold shadow-card text-xs md:text-sm", buttonTone.dark)}>
            <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats & Search Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
               {[
                 { label: 'Vault Items', value: INITIAL_DOCS.length, icon: FileDigit, color: 'bg-status-info-soft text-status-info' },
                 { label: 'Storage Used', value: '4.4 MB', icon: ShieldCheck, color: 'bg-status-positive-soft text-status-positive' },
                 { label: 'Last Update', value: '2d ago', icon: Clock, color: 'bg-status-warning-soft text-status-warning' },
               ].map((stat, i) => (
                 <Card key={i} className={cn(surfaceVariants({ variant: "card", padding: "none" }), "p-4 md:p-6")}>
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-2xl flex items-center justify-center", stat.color)}>
                          <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                       </div>
                       <div>
                          <p className={cn(TH_LABEL, "leading-none mb-1")}>{stat.label}</p>
                          <p className="text-lg md:text-xl font-bold text-foreground">{stat.value}</p>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>

            {/* Document Listing Card */}
            <Card className={cn(surfaceVariants({ variant: "card", padding: "none" }), "overflow-hidden")}>
               <CardHeader className="p-4 md:p-8 border-b border-border">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search vault..." 
                          className="pl-9 md:pl-12 h-10 md:h-12 bg-surface-subtle border-none rounded-lg md:rounded-card text-xs md:text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <Button variant="outline" className="rounded-lg md:rounded-card h-10 md:h-12 border-border text-muted-foreground font-bold text-xs">
                        <Filter className="mr-2 h-3.5 w-3.5" /> Filters
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-surface-subtle/50">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className={cn(TH_LABEL, "pl-4 md:pl-8 h-10 md:h-14")}>Document Name</TableHead>
                          <TableHead className={cn(TH_LABEL, "h-10 md:h-14 hidden md:table-cell")}>Category</TableHead>
                          <TableHead className={cn(TH_LABEL, "text-right pr-4 md:pr-8 h-10 md:h-14")}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id} className="group border-b border-border hover:bg-surface-subtle/50 transition-colors">
                            <TableCell className="pl-4 md:pl-8 py-4 md:py-5">
                               <div className="flex items-center gap-2 md:gap-3">
                                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                     <FileText className="h-4 w-4 md:h-5 md:w-5" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-foreground text-xs md:text-sm">{doc.name}</p>
                                     <div className="flex flex-wrap gap-1 mt-0.5">
                                        {doc.tags.map(tag => (
                                          <span key={tag} className="text-micro md:text-caption font-bold text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded-full">#{tag}</span>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                               <Badge variant="outline" className="rounded-full border-border text-muted-foreground font-bold py-0.5 px-2 text-label">
                                 {doc.type}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4 md:pr-8">
                               <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="View"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Download"><Download className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* AI Tagging Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            <SmartTaggingForm />
            
            <div className="p-6 md:p-8 rounded-card bg-brand-moss text-white shadow-card relative overflow-hidden group">
               <div className="relative z-10 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6 text-white" />
                     <h4 className="text-lg md:text-xl font-bold font-headline">Secure Hub</h4>
                  </div>
                  <p className="text-label md:text-xs font-medium opacity-80 leading-relaxed">
                    Bank-level encryption for all uploaded records. Instant sharing with verified vets during emergencies.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
