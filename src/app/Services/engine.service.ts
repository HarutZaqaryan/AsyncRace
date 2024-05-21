import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEngine } from '../Models/IEngine';
import { IDrive } from '../Models/IDrive';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private engineUrl: string = 'http://127.0.0.1:3000/engine';

  constructor(private http: HttpClient) {}

  public start_stopEngine(id: number, status: string) {
    const params = new HttpParams().set('id', id).set('status', status);
    return this.http.patch<IEngine>(this.engineUrl, {}, { params });
  }

  public engineMode(id: number, status: string) {
    const params = new HttpParams().set('id', id).set('status', status);
    return this.http.patch<IDrive>(
      this.engineUrl,
      {},
      { params, observe: 'response' },
    );
  }
}
