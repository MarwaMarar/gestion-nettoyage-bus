import {AfterViewInit,ChangeDetectorRef,Component,ElementRef,OnDestroy,OnInit,ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {Chart,ArcElement,DoughnutController,Legend,Plugin,Tooltip} from 'chart.js';
import type {Workbook,Worksheet} from 'exceljs';
import {NettoyageService} from '../../service/nettoyage.service';
import {Nettoyage,StatutNettoyage} from '../../service/api.models';

interface Rapport {
  bus:string;
  type:string;
  nettoyeur:string;
  superviseur:string;
  date:string;
  dateIso:string;
  duree:string;
  dureeMinutes:number|null;
  statut:string;
  statutCode:StatutNettoyage;
}

Chart.register(DoughnutController,ArcElement,Tooltip,Legend);

@Component({selector:'app-rapports',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./rapports.html',styleUrl:'./rapports.css'})
export class Rapports implements OnInit,AfterViewInit,OnDestroy {
  @ViewChild('statusChart') statusChart?:ElementRef<HTMLCanvasElement>;
  dateDebut='';dateFin='';busSelectionne='';nettoyeurSelectionne='';superviseurSelectionne='';statutSelectionne='';typeSelectionne='';
  listeBus:string[]=[];listeAgents:string[]=[];listeSuperviseurs:string[]=[];listeTypes:string[]=[];rapports:Rapport[]=[];
  loading=true;errorMessage='';private chart?:Chart<'doughnut'>;private viewReady=false;private exportExcelEnCours=false;

  constructor(private api:NettoyageService,private cdr:ChangeDetectorRef){}

  ngOnInit():void {this.chargerRapports();}
  ngAfterViewInit():void {this.viewReady=true;this.renderChart();}
  ngOnDestroy():void {this.chart?.destroy();}

  private chargerRapports():void {
    this.loading=true;this.errorMessage='';
    this.api.getAll().subscribe({
      next:values=>{
        this.rapports=values.map(value=>this.toRapport(value));
        this.listeBus=[...new Set(this.rapports.map(r=>r.bus))];
        this.listeAgents=[...new Set(this.rapports.map(r=>r.nettoyeur))];
        this.listeSuperviseurs=[...new Set(this.rapports.map(r=>r.superviseur).filter(x=>x!=='—'))];
        this.listeTypes=[...new Set(this.rapports.map(r=>r.type))];
        this.loading=false;this.cdr.detectChanges();this.renderChart();
      },
      error:error=>{console.error('Erreur de chargement des rapports',error);this.rapports=[];this.loading=false;this.errorMessage=error?.error?.message||'Impossible de charger les rapports.';this.cdr.detectChanges();this.renderChart();}
    });
  }

  private toRapport(n:Nettoyage):Rapport {
    return {bus:`Bus ${n.numeroBus}`,type:n.typeNettoyageLibelle,nettoyeur:n.nettoyeurNom,superviseur:n.superviseurNom??'—',date:this.afficherDate(n.dateNettoyage),dateIso:n.dateNettoyage,duree:n.duree!=null?`${n.duree} min`:'—',dureeMinutes:n.duree??null,statut:n.statut==='VALIDE'?'Validé':n.statut==='REFUSE'?'Refusé':'En attente',statutCode:n.statut};
  }

  private filtrer(source:Rapport[]):Rapport[] {
    return source.filter(r=>(!this.dateDebut||r.dateIso>=this.dateDebut)&&(!this.dateFin||r.dateIso<=this.dateFin)&&(!this.busSelectionne||r.bus===this.busSelectionne)&&(!this.nettoyeurSelectionne||r.nettoyeur===this.nettoyeurSelectionne)&&(!this.superviseurSelectionne||r.superviseur===this.superviseurSelectionne)&&(!this.statutSelectionne||r.statut===this.statutSelectionne)&&(!this.typeSelectionne||r.type===this.typeSelectionne));
  }

  get rapportsFiltres():Rapport[]{return this.filtrer(this.rapports);}
  get totalNettoyages():number{return this.rapportsFiltres.length;}
  get nettoyagesValides():number{return this.rapportsFiltres.filter(r=>r.statutCode==='VALIDE').length;}
  get nettoyagesRefuses():number{return this.rapportsFiltres.filter(r=>r.statutCode==='REFUSE').length;}
  get nettoyagesEnAttente():number{return this.rapportsFiltres.filter(r=>r.statutCode==='EN_ATTENTE').length;}

  appliquerFiltres():void {this.renderChart();}

  private renderChart():void {
    if(!this.viewReady||!this.statusChart)return;
    const data=[this.nettoyagesValides,this.nettoyagesRefuses,this.nettoyagesEnAttente];
    this.chart?.destroy();
    const centerText:Plugin<'doughnut'>={id:'centerText',afterDraw:chart=>{const {ctx,chartArea}=chart;if(!chartArea)return;ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()||'#111827';ctx.font='700 28px Arial';ctx.fillText(String(this.totalNettoyages),(chartArea.left+chartArea.right)/2,(chartArea.top+chartArea.bottom)/2-8);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()||'#64748b';ctx.font='12px Arial';ctx.fillText('Total',(chartArea.left+chartArea.right)/2,(chartArea.top+chartArea.bottom)/2+18);ctx.restore();}};
    this.chart=new Chart<'doughnut',number[],string>(this.statusChart.nativeElement,{type:'doughnut',data:{labels:['Validés','Refusés','En attente'],datasets:[{data,backgroundColor:['#16a34a','#dc2626','#d97706'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{enabled:this.totalNettoyages>0}}},plugins:[centerText]});
  }

  private async donneesExport():Promise<Rapport[]> {
    const values=await firstValueFrom(this.api.getAll());
    return this.filtrer(values.map(value=>this.toRapport(value)));
  }

  async exportExcel():Promise<void> {
    if(this.exportExcelEnCours)return;
    this.exportExcelEnCours=true;
    this.errorMessage='';
    try {
      const rapports=await this.donneesExport();
      const {Workbook}=await import('exceljs');
      const workbook=new Workbook();
      workbook.creator='ALSA Clean Fleet';
      workbook.created=new Date();
      this.creerHistorique(workbook,rapports);
      this.creerSyntheses(workbook,rapports);
      this.creerGraphiqueExcel(workbook,rapports);
      const buffer=await workbook.xlsx.writeBuffer();
      this.telecharger(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),this.nomFichier('xlsx'));
    } catch(error) {
      console.error("Erreur lors de l'export Excel",error);
      this.errorMessage="Impossible de générer l'export Excel.";
    } finally {
      this.exportExcelEnCours=false;
    }
  }

  private creerHistorique(workbook:Workbook,rapports:Rapport[]):void {
    const sheet=workbook.addWorksheet('Historique',{views:[{state:'frozen',ySplit:1}]});
    const rows=rapports.length?rapports.map(r=>[r.bus,r.type,r.nettoyeur,r.superviseur,this.dateExcel(r.dateIso),r.dureeMinutes,r.statut]):[['Aucune donnée','','','','','','']];
    sheet.addTable({name:'HistoriqueNettoyages',ref:'A1',headerRow:true,totalsRow:false,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:['Bus','Type de nettoyage','Nettoyeur','Superviseur','Date','Durée','Statut'].map(name=>({name})),rows});
    [18,25,22,22,14,12,16].forEach((width,index)=>sheet.getColumn(index+1).width=width);
    sheet.getColumn(5).numFmt='dd/mm/yyyy';
    sheet.getColumn(6).numFmt='0 "min"';
    sheet.getRow(1).height=24;
    sheet.getRow(1).eachCell(cell=>{
      cell.font={bold:true,color:{argb:'FFFFFFFF'}};
      cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2563EB'}};
      cell.alignment={horizontal:'center',vertical:'middle'};
      cell.border={top:{style:'thin',color:{argb:'FF1D4ED8'}},left:{style:'thin',color:{argb:'FF1D4ED8'}},bottom:{style:'thin',color:{argb:'FF1D4ED8'}},right:{style:'thin',color:{argb:'FF1D4ED8'}}};
    });
    sheet.autoFilter={from:'A1',to:'G1'};
  }

  private creerSyntheses(workbook:Workbook,rapports:Rapport[]):void {
    const sheet=workbook.addWorksheet('Tableau croisé dynamique');
    let nextRow=this.ajouterSynthese(sheet,'Nettoyages par type et statut','Type de nettoyage',[...new Set(rapports.map(r=>r.type))].sort(),rapports,r=>r.type,1);
    nextRow+=2;
    this.ajouterSynthese(sheet,'Nettoyages par bus et statut','Bus',[...new Set(rapports.map(r=>r.bus))].sort(),rapports,r=>r.bus,nextRow);
    sheet.getColumn(1).width=28;
    [2,3,4,5].forEach(column=>sheet.getColumn(column).width=15);
  }

  private creerGraphiqueExcel(workbook:Workbook,rapports:Rapport[]):void {
    const sheet=workbook.addWorksheet('Graphique');
    sheet.getColumn(1).width=24;sheet.getColumn(2).width=16;
    sheet.mergeCells('A1:H2');
    const title=sheet.getCell('A1');title.value='Répartition des nettoyages par statut';title.font={bold:true,size:18,color:{argb:'FF1E3A8A'}};title.alignment={horizontal:'center',vertical:'middle'};
    const statistiques:[string,number][]=[['Total',rapports.length],['Validés',rapports.filter(r=>r.statutCode==='VALIDE').length],['Refusés',rapports.filter(r=>r.statutCode==='REFUSE').length],['En attente',rapports.filter(r=>r.statutCode==='EN_ATTENTE').length]];
    statistiques.forEach(([label,count],index)=>{const row=index+4;sheet.getCell(row,1).value=label;sheet.getCell(row,2).value=count;sheet.getCell(row,1).font={bold:true};sheet.getCell(row,2).font={bold:true};sheet.getCell(row,2).alignment={horizontal:'center'};});
    if(rapports.length===0){sheet.mergeCells('A10:H12');const empty=sheet.getCell('A10');empty.value='Aucune donnée';empty.font={italic:true,size:14,color:{argb:'FF64748B'}};empty.alignment={horizontal:'center',vertical:'middle'};return;}
    const imageId=workbook.addImage({base64:this.creerImageGraphique(rapports),extension:'png'});
    sheet.addImage(imageId,{tl:{col:2,row:3},ext:{width:800,height:420}});
  }

  private ajouterSynthese(sheet:Worksheet,title:string,dimension:string,items:string[],rapports:Rapport[],key:(rapport:Rapport)=>string,startRow:number):number {
    const labels:[string,StatutNettoyage][]=[['Validés','VALIDE'],['Refusés','REFUSE'],['En attente','EN_ATTENTE']];
    const titleCell=sheet.getCell(startRow,1);titleCell.value=title;titleCell.font={bold:true,size:14,color:{argb:'FF1E3A8A'}};
    const headerRow=startRow+1;
    const headers=[dimension,...labels.map(([label])=>label),'Total'];
    headers.forEach((header,index)=>{const cell=sheet.getCell(headerRow,index+1);cell.value=header;cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2563EB'}};cell.alignment={horizontal:'center'};});
    items.forEach((item,itemIndex)=>{
      const row=headerRow+1+itemIndex;
      const subset=rapports.filter(r=>key(r)===item);
      sheet.getCell(row,1).value=item;
      labels.forEach(([,status],statusIndex)=>sheet.getCell(row,statusIndex+2).value=subset.filter(r=>r.statutCode===status).length);
      sheet.getCell(row,5).value=subset.length;
    });
    const totalRow=headerRow+1+items.length;
    sheet.getCell(totalRow,1).value='Total général';
    labels.forEach(([,status],statusIndex)=>sheet.getCell(totalRow,statusIndex+2).value=rapports.filter(r=>r.statutCode===status).length);
    sheet.getCell(totalRow,5).value=rapports.length;
    for(let column=1;column<=5;column++){const cell=sheet.getCell(totalRow,column);cell.font={bold:true};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFDCE6F1'}};}
    return totalRow+1;
  }

  async exportPDF():Promise<void> {
    this.errorMessage='';
    try {
      const rapports=await this.donneesExport();
      const [{jsPDF},{default:autoTable}]=await Promise.all([import('jspdf'),import('jspdf-autotable')]);
      const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('Rapports & Analyses',14,15);
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      const filtres=[`Période : ${this.dateDebut||'Toutes'} - ${this.dateFin||'Toutes'}`,`Bus : ${this.busSelectionne||'Tous'}   Nettoyeur : ${this.nettoyeurSelectionne||'Tous'}   Superviseur : ${this.superviseurSelectionne||'Tous'}`,`Type : ${this.typeSelectionne||'Tous'}   Statut : ${this.statutSelectionne||'Tous'}`];
      filtres.forEach((ligne,index)=>doc.text(ligne,14,23+index*5));
      const chartImage=this.creerImageGraphique(rapports);
      doc.addImage(chartImage,'PNG',109,39,80,55);
      autoTable(doc,{startY:100,head:[['Bus','Type de nettoyage','Nettoyeur','Superviseur','Date','Durée','Statut']],body:rapports.length?rapports.map(r=>[r.bus,r.type,r.nettoyeur,r.superviseur,r.date,r.duree,r.statut]):[['Aucune donnée','','','','','','']],theme:'grid',styles:{font:'helvetica',fontSize:8,cellPadding:2,overflow:'linebreak'},headStyles:{fillColor:[37,99,235],textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[245,248,252]},margin:{left:14,right:14}});
      doc.save(this.nomFichier('pdf'));
    } catch(error) {
      console.error("Erreur lors de l'export PDF",error);
      this.errorMessage="Impossible de générer l'export PDF.";
    }
  }

  private creerImageGraphique(rapports:Rapport[]):string {
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=420;
    const total=rapports.length;
    const fond:Plugin<'doughnut'>={id:'exportBackground',beforeDraw:chart=>{chart.ctx.save();chart.ctx.fillStyle='#ffffff';chart.ctx.fillRect(0,0,chart.width,chart.height);chart.ctx.restore();}};
    const centre:Plugin<'doughnut'>={id:'exportCenter',afterDraw:chart=>{const {ctx,chartArea}=chart;if(!chartArea)return;ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111827';ctx.font='bold 38px Arial';ctx.fillText(String(total),(chartArea.left+chartArea.right)/2,(chartArea.top+chartArea.bottom)/2-8);ctx.font='18px Arial';ctx.fillStyle='#64748b';ctx.fillText('Total',(chartArea.left+chartArea.right)/2,(chartArea.top+chartArea.bottom)/2+28);ctx.restore();}};
    const chart=new Chart<'doughnut',number[],string>(canvas,{type:'doughnut',data:{labels:['Validés','Refusés','En attente'],datasets:[{data:[rapports.filter(r=>r.statutCode==='VALIDE').length,rapports.filter(r=>r.statutCode==='REFUSE').length,rapports.filter(r=>r.statutCode==='EN_ATTENTE').length],backgroundColor:['#16a34a','#dc2626','#d97706'],borderColor:'#ffffff',borderWidth:2}]},options:{responsive:false,animation:false,cutout:'65%',plugins:{legend:{display:true,position:'right',labels:{font:{size:16},generateLabels:chartInstance=>{const dataset=chartInstance.data.datasets[0];return (chartInstance.data.labels??[]).map((label,index)=>({text:`${label} : ${dataset.data[index]??0}`,fillStyle:Array.isArray(dataset.backgroundColor)?String(dataset.backgroundColor[index]):'#64748b',strokeStyle:'#ffffff',lineWidth:1,hidden:false,index}));}}},tooltip:{enabled:false}}},plugins:[fond,centre]});
    const image=canvas.toDataURL('image/png');chart.destroy();return image;
  }

  private dateExcel(value:string):Date {const [year,month,day]=value.split('-').map(Number);return new Date(year,month-1,day);}
  private afficherDate(value:string):string {const [year,month,day]=value.split('-');return `${day}/${month}/${year}`;}
  private nomFichier(extension:'xlsx'|'pdf'):string {return `rapport-nettoyages-${new Date().toISOString().slice(0,10)}.${extension}`;}
  private telecharger(blob:Blob,filename:string):void {const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();URL.revokeObjectURL(url);}
}
