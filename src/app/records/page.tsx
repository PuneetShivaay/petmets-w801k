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
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Health Security Vault</h1>
          <p className="text-slate-500 mt-1">A centralized, secure locker for all your pet's critical documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-2xl h-12 px-6 bg-slate-900 font-bold shadow-lg hover:scale-105 transition-all">
            <Upload className="mr-2 h-5 w-5" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Stats & Search Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { label: 'Total Vault Items', value: INITIAL_DOCS.length, icon: FileDigit, color: 'bg-blue-50 text-blue-600' },
                 { label: 'Storage Used', value: '4.4 MB', icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
                 { label: 'Last Updated', value: '2d ago', icon: Clock, color: 'bg-orange-50 text-orange-600' },
               ].map((stat, i) => (
                 <Card key={i} className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-4">
                       <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.color)}>
                          <stat.icon className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">{stat.label}</p>
                          <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>

            {/* Document Listing Card */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
               <CardHeader className="p-8 border-b border-slate-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="Search vault by name or tags..." 
                          className="pl-12 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-2xl h-12 border-slate-200 text-slate-600 font-bold">
                           <Filter className="mr-2 h-4 w-4" /> Filters
                        </Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="pl-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 h-14">Document Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 h-14">Category</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 h-14">Date Added</TableHead>
                          <TableHead className="text-right pr-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 h-14">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="pl-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                     <FileText className="h-5 w-5" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-800">{doc.name}</p>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                        {doc.tags.map(tag => (
                                          <span key={tag} className="text-[9px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">#{tag}</span>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500 font-bold py-1 px-3">
                                 {doc.type}
                               </Badge>
                            </TableCell>
                            <TableCell>
                               <p className="text-sm font-bold text-slate-500">{doc.date}</p>
                               <p className="text-[10px] text-slate-400">{doc.size}</p>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                               <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" title="View"><Eye className="h-4 w-4 text-slate-400" /></Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" title="Download"><Download className="h-4 w-4 text-slate-400" /></Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {documents.length === 0 && (
                    <div className="py-24 text-center">
                       <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <Search className="h-10 w-10 text-slate-200" />
                       </div>
                       <p className="text-xl font-bold text-slate-800">No documents found</p>
                       <p className="text-slate-500 mt-2">Try a different search term or upload a new record.</p>
                    </div>
                  )}
               </CardContent>
               <CardFooter className="p-8 bg-slate-50/30 flex justify-center">
                  <Button variant="link" className="text-primary font-bold text-xs uppercase tracking-widest">
                     View Archived Records <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
               </CardFooter>
            </Card>
         </div>

         {/* AI Tagging Sidebar */}
         <div className="lg:col-span-4 space-y-8">
            <SmartTaggingForm />

            <div className="p-8 rounded-[2.5rem] bg-[#2D4A22] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7" />
                     </div>
                     <h4 className="text-2xl font-bold font-headline leading-tight">Secure Health Hub</h4>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                           <Plus className="h-3 w-3" />
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-snug">Bank-level encryption for all uploaded PDFs and photos.</p>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                           <Plus className="h-3 w-3" />
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-snug">Instant sharing with verified vets during emergencies.</p>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                           <Plus className="h-3 w-3" />
                        </div>
                        <p className="text-sm font-medium opacity-80 leading-snug">Automated AI organization using GenAI flows.</p>
                     </div>
                  </div>

                  <Button variant="secondary" className="w-full h-12 rounded-2xl bg-white text-[#2D4A22] font-bold hover:bg-slate-50 shadow-xl transition-all">
                     Update Vault Settings
                  </Button>
               </div>
               <FileText className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 -rotate-12" />
            </div>
         </div>
      </section>
    </div>
  );
}
