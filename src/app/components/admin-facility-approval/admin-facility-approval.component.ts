import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TurfService } from '../../services/turf.service';

@Component({
  selector: 'app-admin-facility-approval',
  templateUrl: './admin-facility-approval.component.html',
  styleUrls: ['./admin-facility-approval.component.css']
})
export class AdminFacilityApprovalComponent implements OnInit {
  pendingTurfs$!: Observable<any[]>;

  constructor(private turfService: TurfService) {}

  ngOnInit(): void {
    this.pendingTurfs$ = this.turfService.getTurfs().pipe(
      map(turfs => turfs.filter(turf => turf.status === 'pending'))
    );
  }

  approve(turfId: number): void {
    this.turfService.updateTurfStatus(turfId, 'approved');
  }

  reject(turfId: number): void {
    this.turfService.updateTurfStatus(turfId, 'rejected');
  }
}