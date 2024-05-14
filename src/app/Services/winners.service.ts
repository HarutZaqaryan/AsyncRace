import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IWinners } from '../Models/IWinners';

type TWinner = Omit<IWinners, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private winnersURL: string = 'http://127.0.0.1:3000/winners';

  constructor(private http: HttpClient) {}

  getAllWinners() {
    return this.http.get<IWinners[]>(this.winnersURL);
  }

  getWinners(limit: number, page: number, sort?: string, order?: string) {
    return this.http.get<IWinners[]>(
      sort
        ? `${this.winnersURL}?_limit=${limit}&&_page=${page}&&_sort=${sort}&&_order=${order}`
        : `${this.winnersURL}?_limit=${limit}&&_page=${page}`,
      { observe: 'response' },
    );
  }

  getWinner(id: number) {
    return this.http.get<IWinners>(`${this.winnersURL}/${id}`);
  }

  createWinner(winner: IWinners) {
    return this.http.post<IWinners>(this.winnersURL, winner, {
      headers: { 'Content-type': 'application/json' },
    });
  }

  updateWinners(id: number, wins: number, time: number) {
    return this.http.put<TWinner>(
      `${this.winnersURL}/${id}`,
      { wins, time },
      { headers: { 'Content-type': 'application/json' } },
    );
  }

  deleteWinner(id: number) {
    return this.http.delete(`${this.winnersURL}/${id}`);
    // ! I tried adding parameters this way, but it's not working.
    // let params = new HttpParams().set('id',id)
    // return this.http.delete(this.winnersURL,{params});
  }
}
