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
import { LazyLoadEvent } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';

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
    FormsModule,
    PaginatorModule,
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css',
})
export class LogComponent implements OnInit {
  @ViewChild('dt2') dt2: Table | undefined;

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  usernameFilter: string = '';

  selectedLogs: any[] = [];

  constructor(private apiLog: LogService, private pop: PopupService) {}

  // applyFilterGlobal($event: any, stringVal: any) {
  //   this.dt2!.filterGlobal(
  //     ($event.target as HTMLInputElement).value,
  //     stringVal
  //   );
  // }

  ngOnInit(): void {
    // this.getlog();
  }

  totalRows = 0;
  loading = false;
  logs: any[] = [];

  first: number = 0;
  rows: number = 10;
  rowsPerPageOptions = [10, 20, 30];
  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    console.log(this.first, this.rows);
    this.loadSysLogsLazy();
  }
  loadSysLogsLazy() {
    this.loading = true;

    if (this.first !== undefined && this.rows !== undefined) {
      const page = this.first / this.rows! + 1;
      const pageSize = this.rows!;

      this.apiLog
        .GetLogPaging(
          pageSize,
          page,
          this.usernameFilter,
          this.dateFrom,
          this.dateTo
        )
        .subscribe({
          next: (res) => {
            if (res.result == '1') {
              this.logs = res.data;
              this.totalRows = res.totalRows;
              this.loading = false;
            } else {
              this.pop.showOkPopup({ message: 'Lỗi lấy nhật ký hệ thống!' });
              this.loading = false;
            }
          },
          error: (err) => {
            this.pop.showOkPopup({ message: 'Lỗi kết nối tới server!' });
            console.log(err);

            this.loading = false;
          },
        });
    }
  }

  filter() {
    if (this.usernameFilter || this.dateFrom || this.dateTo) {
      if (this.dateFrom && this.dateTo) {
        if (this.dateFrom > this.dateTo) {
          this.pop.showOkPopup({
            message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
          });
          return;
        }
      }
      this.selectedLogs.length = 0;
      this.loadSysLogsLazy();
    } else {
      this.pop.showOkPopup({ message: 'Điền tiêu chí lọc!' });
    }
  }

  refresh() {
    this.dateFrom = null;
    this.dateTo = null;
    this.usernameFilter = '';
    this.first = 0;
    this.rows = 10;
    this.selectedLogs.length = 0;
    this.loadSysLogsLazy();
  }

  selectedLogIds: number[] = [];

  handleDeleteLogs() {
    if (this.selectedLogs.length == 0) {
      this.pop.showOkPopup({ message: 'Vui lòng chọn 1 log để xoá!' });
    } else {
      this.pop.showYesNoPopup({
        header: 'Xác nhận',
        message: 'Bạn có chắc chắn muốn xoá Logs?',
        onAccept: () => {
          this.deleteSelectedLogs();
        },
        onReject: () => {
          console.log('huy');
        },
      });
    }
  }
  deleteSelectedLogs() {
    this.selectedLogs.forEach((element) => {
      this.selectedLogIds.push(element.id);
    });
    this.apiLog.DeleteLogByIds(this.selectedLogIds).subscribe({
      next: (res) => {
        if (res.result == '1') {
          this.pop.showOkPopup({ message: res.message });
          this.selectedLogs.length = 0;
          this.selectedLogIds.length = 0;
          this.loadSysLogsLazy();
        } else {
          this.pop.showOkPopup({ message: 'Lỗi xoá log!' });
          console.log(res.message);
        }
      },
      error: (err) => {
        this.pop.showOkPopup({ message: 'Không thể kết nối server!' });
        console.log(err);
      },
    });
  }
}
