import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TurfService } from '../../services/turf.service';

@Component({
  selector: 'app-admin-turf-management',
  templateUrl: './admin-turf-management.component.html',
  styleUrls: ['./admin-turf-management.component.css']
})
export class AdminTurfManagementComponent implements OnInit {
  turfs$!: Observable<any[]>;
  turfForm: FormGroup;
  isEditing = false;
  currentTurfId: number | null = null;

  constructor(private turfService: TurfService, private fb: FormBuilder) {
    this.turfForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.turfs$ = this.turfService.getTurfs();
  }

  editTurf(turf: any) {
    this.isEditing = true;
    this.currentTurfId = turf.id;
    this.turfForm.patchValue(turf);
  }

  saveTurf() {
    if (this.turfForm.valid) {
      if (this.isEditing) {
        this.turfService.updateTurf({ id: this.currentTurfId, ...this.turfForm.value });
      } else {
        this.turfService.addTurf(this.turfForm.value);
      }
      this.resetForm();
    }
  }

  deleteTurf(turfId: number) {
    if (confirm('Are you sure you want to delete this turf?')) {
      this.turfService.deleteTurf(turfId);
    }
  }
  
  resetForm() {
    this.turfForm.reset();
    this.isEditing = false;
    this.currentTurfId = null;
  }
}