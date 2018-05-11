/*
 MIT License

 Copyright (c) 2018 Temainfo Software

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
import {
  Component, Input, OnChanges, SimpleChanges, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterContentInit,
  AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { ScheduleDataSource } from './types/datasource.type';

@Component( {
  selector: 'tl-schedule',
  templateUrl: './schedule.html',
  styleUrls: [ './schedule.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TlSchedule implements OnInit, OnChanges {

  @Input() currentView: 'day' | 'week' | 'month' | 'workWeek' | 'dayList' | 'weekList'  = 'day';

  @Input() views: ['day' | 'week' | 'month' | 'workWeek' | 'dayList' | 'weekList'] = ['day', 'dayList'];

  @Input() currentDate = new Date();

  @Input() height = '550px';

  @Input() duration = 30;

  @Input('dataSource') set dataSource( dataSource: ScheduleDataSource[] ) {
    this._dataSource = dataSource.sort(( a, b ) => a.date.start - b.date.start || b.date.end - a.date.end );
  }
  get dataSource () {
    return this._dataSource;
  }

  @Input('startDayHour') set startDayHour( hours: string ) {
    this._startDayHour = hours;
    this.startDayMilliseconds = this.transformHourToMileseconds( hours );
  }
  get startDayHour () {
    return this._startDayHour;
  }

  @Input('endDayHour') set setEndDayHour( hours: string ) {
    this._endDayHour = hours;
    this.endDayMilliseconds = this.transformHourToMileseconds( hours );
  }
  get endDayHour () {
    return this._endDayHour;
  }

  @Output() rowClick = new EventEmitter();

  public startDayMilliseconds: number;

  public endDayMilliseconds: number;

  public dataSourceOfDay: ScheduleDataSource[];

  private _dataSource: ScheduleDataSource[];

  private _startDayHour: string;

  private _endDayHour: string;

  constructor() {}

  ngOnInit() {
    this.getDataSourceOfDay();
  }

  ngOnChanges(  changes: SimpleChanges  ) {
    if ( !changes['currentDate'] ) { return; }
    if ( ! changes['currentDate'].firstChange) {
      this.refreshStartAndEndDay();
      this.getDataSourceOfDay();
    }
  }

  onChangeView( view ) {
    this.currentView = view;
  }

  onChangeNavigator($event) {
    this.currentDate = new Date( $event.year, $event.month, $event.day);
    this.refreshStartAndEndDay();
    this.getDataSourceOfDay();
  }

  private transformHourToMileseconds( fullHour: string ) {
    const hourSplited = fullHour.split(':');

    const hours = Number(hourSplited[0]);
    const minutes = Number(hourSplited[1]);
    const year =  this.currentDate.getFullYear();
    const month =  this.currentDate.getMonth();
    const date =  this.currentDate.getDate();

    return new Date(year, month, date, hours, minutes).getTime();
  }

  private refreshStartAndEndDay() {
    this.endDayMilliseconds = this.transformHourToMileseconds( this.endDayHour );
    this.startDayMilliseconds = this.transformHourToMileseconds( this.startDayHour );
  }


  private getDataSourceOfDay() {
    this.dataSourceOfDay = this._dataSource.filter( ( event ) => {
      return ( event.date.start >= this.startDayMilliseconds ) && ( event.date.end <= this.endDayMilliseconds );
    });
  }
}
