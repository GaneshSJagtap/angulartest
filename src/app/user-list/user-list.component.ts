import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../services/data.service";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { userData } from "../models/userData";
import { DataSource } from "@angular/cdk/collections";
import { AddDialogComponent } from "../dialogs/add/add.dialog.component";
import { EditDialogComponent } from "../dialogs/edit/edit.dialog.component";
import { DeleteDialogComponent } from "../dialogs/delete/delete.dialog.component";
import { BehaviorSubject, fromEvent, merge, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"]
})
export class UserListComponent implements OnInit {
  displayedColumns = [
    "id",
    "fName",
    "lName",
    "userName",
    "city",
    "department",
    "actions"
  ];
  exampleDatabase: DataService | null;
  dataSource: ExampleDataSource | null;
  id: number;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public dataService: DataService
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: true }) filter: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew(user: userData) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.exampleDatabase.dataChange.value.push(
          this.dataService.getDialogData()
        );
        this.refreshTable();
      }
    });
  }

  startEdit(
    i: number,
    id: number,
    fName: string,
    lName: string,
    userName: string,
    city: string,
    department: string
  ) {
    this.id = id;
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        id: id,
        fName: fName,
        lName: lName,
        userName: userName,
        city: city,
        department: department
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(
          x => x.id === this.id
        );
        // Then you update that record using data from dialogData (values you enetered)
        this.exampleDatabase.dataChange.value[
          foundIndex
        ] = this.dataService.getDialogData();
        // And lastly refresh table
        this.refreshTable();
      }
    });
  }

  deleteItem(
    i: number,
    id: number,
    fName: string,
    lName: string,
    userName: string,
    city: string,
    department: string
  ) {
    this.id = id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        id: id,
        fName: fName,
        lName: lName,
        userName: userName,
        city: city,
        department: department
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(
          x => x.id === this.id
        );
        // for delete we use splice in order to remove single object from DataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.exampleDatabase = new DataService(this.httpClient);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
    fromEvent(this.filter.nativeElement, "keyup").subscribe(() => {
      if (!this.dataSource) {
        return;
      }
      this.dataSource.filter = this.filter.nativeElement.value;
    });
  }
}

export class ExampleDataSource extends DataSource<userData> {
  _filterChange = new BehaviorSubject("");

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: userData[] = [];
  renderedData: userData[] = [];

  constructor(
    public _exampleDatabase: DataService,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  // Connect function called by the table to retrieve one stream containing the data to render.

  connect(): Observable<userData[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination

    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.getAllUsers();

    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this._exampleDatabase.data
          .slice()
          .filter((user: userData) => {
            const searchStr = (
              user.fName +
              user.lName +
              user.userName +
              user.city +
              user.department
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });

        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());

        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  /** Returns a sorted copy of the database data. */
  sortData(data: userData[]): userData[] {
    if (!this._sort.active || this._sort.direction === "") {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";

      switch (this._sort.active) {
        case "id":
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case "fName":
          [propertyA, propertyB] = [a.fName, b.fName];
          break;
        case "lName":
          [propertyA, propertyB] = [a.lName, b.lName];
          break;
        case "userName":
          [propertyA, propertyB] = [a.userName, b.userName];
          break;
        case "created_at":
          [propertyA, propertyB] = [a.city, b.city];
          break;
        case "city":
          [propertyA, propertyB] = [a.department, b.department];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === "asc" ? 1 : -1)
      );
    });
  }
}
