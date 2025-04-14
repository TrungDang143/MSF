import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { LogService } from '../../../services/log.service';
import { PopupService } from '../../../shared/popup/popup.service';
import { DateTimeService } from '../../../utils/date-time.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log',
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    ButtonModule,
    CommonModule,
    DatePickerModule,
    FormsModule
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css',
})
export class LogComponent implements OnInit {
  @ViewChild('dt2') dt2: Table | undefined;
  systemLog: any[] = [];

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  globalFilterValue: string = '';

  originalLogs: any[] = []; // Lưu toàn bộ dữ liệu ban đầu

  constructor(private apiLog: LogService, private pop: PopupService) {}

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt2!.filterGlobal(
      ($event.target as HTMLInputElement).value,
      stringVal
    );
  }

  ngOnInit(): void {
    this.getlog();
  }

  getlog() {
    this.apiLog.GetAllLog().subscribe({
      next: (res) => {
        if (res) {
          // for (let i = 0; i < res.data.length; i++) {
          //   res.data[i].createdAt = DateTimeService.ConvertUtcToTimeZone(
          //     res.data[i].createdAt
          //   );
          // }
          this.systemLog = res.data;
          this.originalLogs = res.data;
          console.log('data', res);
        }
      },
      error: (err) => {
        if (err === 403) {
          this.pop.showOkPopup({ message: 'Bạn không có quyền truy cập!' });
        } else {
          this.pop.showOkPopup({ message: 'Lỗi kết nối tới server!' });
          console.log(err);
        }
      },
    });
  }

  filterByDateRange() {
    if (!this.dateFrom && !this.dateTo) {
      this.systemLog = [...this.originalLogs];
      return;
    }

    this.systemLog = this.originalLogs.filter((log) => {
      const logDate = new Date(log.createdAt);
      const from = this.dateFrom ? new Date(this.dateFrom) : null;
      const to = this.dateTo ? new Date(this.dateTo) : null;

      if (from && to) return logDate >= from && logDate <= to;
      if (from) return logDate >= from;
      if (to) return logDate <= to;
      return true;
    });
  }

  clearDateFilter() {
    this.dateFrom = null;
    this.dateTo = null;
    this.globalFilterValue = '';
    this.systemLog = [...this.originalLogs];
    if (this.dt2) {
      this.dt2.reset(); 
    }
  }

  // selectedCustomer!: Customer[]
  //cols = [
  //     { field: 'name', header: 'Name', customExportHeader: 'ten nguoi' },
  //     { field: 'country.name', header: 'Country' },
  //     { field: 'company', header: 'Company' },
  //     { field: 'representative.name', header: 'Representative' }
  // ];
  // resolveFieldData(data: any, field: string): any {
  //   if (!data || !field) return null;
  //   if (field.indexOf('.') === -1) {
  //     return data[field];
  //   } else {
  //     let fields = field.split('.');
  //     let value = data;
  //     for (let f of fields) {
  //       if (value == null) return null;
  //       value = value[f];
  //     }
  //     return value;
  //   }
  // }
  // show(){
  //   console.log(this.selectedCustomer)
  // }
}
