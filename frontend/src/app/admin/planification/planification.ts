import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Bus, Nettoyage, StatutNettoyage, TypeNettoyage } from '../../service/api.models';
import { BusService } from '../../service/bus.service';
import { NettoyageService } from '../../service/nettoyage.service';
import { TypeNettoyageService } from '../../service/type-nettoyage.service';

@Component({selector:'app-planification',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./planification.html',styleUrl:'./planification.css'})
export class Planification implements OnInit {
  date = this.localDate(new Date()); busId: number|null = null; typeId: number|null = null; statut: StatutNettoyage|'' = '';
  private appliedDate=this.date; private appliedBusId:number|null=null; private appliedTypeId:number|null=null; private appliedStatut:StatutNettoyage|''='';
  bus: Bus[]=[]; types: TypeNettoyage[]=[]; values: Nettoyage[]=[]; selected: Nettoyage|null=null;
  page=0; size=20; totalPages=0; totalElements=0; loading=false; exporting=false; error='';
  readonly labels:Record<StatutNettoyage,string>={EN_ATTENTE:'En attente',VALIDE:'Validé',REFUSE:'Refusé'};
  get selectedBusLabel():string|null { const value=this.bus.find(bus=>bus.id===this.appliedBusId);return value?`Bus ${value.numeroBus}`:null; }
  get formattedDate():string { return new Date(`${this.appliedDate}T00:00:00`).toLocaleDateString('fr-FR'); }
  constructor(private cleanings:NettoyageService,private buses:BusService,private cleaningTypes:TypeNettoyageService,private cdr:ChangeDetectorRef){}
  ngOnInit():void { forkJoin({bus:this.buses.getAll(),types:this.cleaningTypes.getAll()}).subscribe({next:r=>{this.bus=r.bus;this.types=r.types;this.load();},error:e=>{this.error=e?.error?.message||'Impossible de charger les filtres.';this.cdr.detectChanges();}}); }
  applyFilters():void { this.appliedDate=this.date;this.appliedBusId=this.busId;this.appliedTypeId=this.typeId;this.appliedStatut=this.statut;this.page=0;this.load(); }
  clearBusFilter():void { this.busId=null;this.applyFilters(); }
  previous():void { if(this.page>0){this.page--;this.load();} }
  next():void { if(this.page+1<this.totalPages){this.page++;this.load();} }
  open(value:Nettoyage):void { this.selected=value; }
  close():void { this.selected=null; }
  load():void { if(!this.appliedDate)return;this.loading=true;this.error='';this.cleanings.planningPage(this.appliedDate,this.page,this.size,this.appliedBusId??undefined,this.appliedTypeId??undefined,this.appliedStatut||undefined).subscribe({next:r=>{this.values=r.content;this.totalPages=r.totalPages;this.totalElements=r.totalElements;this.loading=false;this.cdr.detectChanges();},error:e=>{this.loading=false;this.error=e?.error?.message||'Impossible de charger la planification.';this.cdr.detectChanges();}}); }
  exportCsv():void { this.withExport(values=>{const headers=['Date','Bus','Type de nettoyage','Fréquence','Nettoyeur','Superviseur','Heure début','Heure fin','Durée (min)','Statut','Remarque nettoyeur','Remarque superviseur'];const rows=values.map(n=>[n.dateNettoyage,n.numeroBus,n.typeNettoyageLibelle,this.frequency(n),n.nettoyeurNom,n.superviseurNom??'',this.time(n.heureDebut),this.time(n.heureFin),n.duree??'',this.labels[n.statut],n.remarqueNettoyeur??'',n.remarqueSuperviseur??'']);const csv='\uFEFF'+[headers,...rows].map(row=>row.map(value=>this.csvCell(value)).join(';')).join('\r\n');this.download(new Blob([csv],{type:'text/csv;charset=utf-8'}),`planification_${this.appliedDate}.csv`);}); }
  exportExcel():void { this.withExport(async values=>{const ExcelJS=await import('exceljs');const workbook=new ExcelJS.Workbook();const sheet=workbook.addWorksheet('Planification');sheet.columns=[{header:'Date',key:'date',width:14},{header:'Bus',key:'bus',width:14},{header:'Type de nettoyage',key:'type',width:24},{header:'Fréquence',key:'frequency',width:18},{header:'Nettoyeur',key:'cleaner',width:22},{header:'Superviseur',key:'supervisor',width:22},{header:'Heure début',key:'start',width:14},{header:'Heure fin',key:'end',width:14},{header:'Durée (min)',key:'duration',width:14},{header:'Statut',key:'status',width:14},{header:'Remarque nettoyeur',key:'cleanerRemark',width:30},{header:'Remarque superviseur',key:'supervisorRemark',width:30}];values.forEach(n=>sheet.addRow({date:n.dateNettoyage,bus:n.numeroBus,type:n.typeNettoyageLibelle,frequency:this.frequency(n),cleaner:n.nettoyeurNom,supervisor:n.superviseurNom??'',start:this.time(n.heureDebut),end:this.time(n.heureFin),duration:n.duree??'',status:this.labels[n.statut],cleanerRemark:n.remarqueNettoyeur??'',supervisorRemark:n.remarqueSuperviseur??''}));sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2563EB'}};sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter={from:'A1',to:'L1'};const buffer=await workbook.xlsx.writeBuffer();this.download(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`planification_${this.appliedDate}.xlsx`);}); }
  private withExport(action:(values:Nettoyage[])=>void|Promise<void>):void { if(this.exporting||!this.appliedDate)return;this.exporting=true;this.error='';this.cleanings.planningExport(this.appliedDate,this.appliedBusId??undefined,this.appliedTypeId??undefined,this.appliedStatut||undefined).subscribe({next:async values=>{try{await action(values);}catch{this.error="Impossible de générer l'export.";}finally{this.exporting=false;this.cdr.detectChanges();}},error:e=>{this.exporting=false;this.error=e?.error?.message||"Impossible de charger les données à exporter.";this.cdr.detectChanges();}}); }
  private frequency(value:Nettoyage):string { return this.types.find(type=>type.id===value.typeNettoyageId)?.frequence??''; }
  private time(value?:string):string { return value?new Date(value).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):''; }
  private csvCell(value:unknown):string { let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`; }
  private download(blob:Blob,name:string):void { const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url); }
  private localDate(date:Date):string { const offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,10); }
}
