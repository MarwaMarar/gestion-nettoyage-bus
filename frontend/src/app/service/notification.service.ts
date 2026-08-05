import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface AppNotification { id:number; nettoyageId?:number; message:string; lue:boolean; dateCreation:string; }
@Injectable({providedIn:'root'})
export class NotificationService {
  private readonly url=`${environment.apiUrl}/notifications`;
  constructor(private http:HttpClient){}
  getMine():Observable<AppNotification[]>{return this.http.get<AppNotification[]>(this.url);}
  markRead(id:number):Observable<AppNotification>{return this.http.put<AppNotification>(`${this.url}/${id}/lire`,{});}
  delete(id:number):Observable<void>{return this.http.delete<void>(`${this.url}/${id}`);}
}
