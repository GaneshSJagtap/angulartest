import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { userData } from "../models/userData";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class DataService {
  private readonly API_URL = "./assets/data.json";

  dataChange: BehaviorSubject<userData[]> = new BehaviorSubject<userData[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;

  constructor(private httpClient: HttpClient) {}

  get data(): userData[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }
  getAllUsers(): void {
    this.httpClient.get<userData[]>(this.API_URL).subscribe(
      data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + " " + error.message);
      }
    );
  }

  addUser(user: userData): void {
    this.dialogData = user;
  }

  updateUser(user: userData): void {
    this.dialogData = user;
  }

  deleteUser(id: number): void {
    console.log(id);
  }
}
