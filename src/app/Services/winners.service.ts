import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IWinners } from '../Models/IWinners';

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private winnersURL: string = 'http://127.0.0.1:3000/winners';

  constructor(private http: HttpClient) {}

  getWinners(limit: number, page: number, sort?: string, order?: string) {
    return this.http.get<IWinners[]>(
      sort
        ? `${this.winnersURL}?_limit=${limit}&&_page=${page}&&_sort=${sort}&&_order=${order}`
        : `${this.winnersURL}?_limit=${limit}&&_page=${page}`,
      { observe: 'response' }
    );
    // ! I tried adding parameters this way, but it's not working.
    // let params = new HttpParams().set('id',id)
    // return this.http.get<IWinners[]>(this.winnersURL,{params});
  }
}
