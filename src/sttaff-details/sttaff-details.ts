import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataTransferService } from '../service/DataTransfer.service'; // Path assumption based on structure


@Component({
  selector: 'app-staff-details',
  templateUrl: './sttaff-details.html',
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  standalone: true,
  styleUrls: ['./sttaff-details.scss'] // Assuming a new SCSS file or using global styles
})
export class StaffDetailsComponent implements OnInit {

  staffForm!: FormGroup;
  finalSubmissionStatus: 'initial' | 'submitting' | 'success' | 'server_error' = 'initial';
  showLoader = false; // Controls the professional loader

  // ⭐️ NEW: Output to signal success to the parent (AppComponent)
  @Output() submissionComplete = new EventEmitter<void>();

  // !!! REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT WEB APP URL !!!
  private readonly SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWikY7deUOH0MDW7eP_wDS3luNmtZZb3Lktlsw3BTvkNI7Pr5cATbODukUDkz_xtvt/exec';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private dataTransfer: DataTransferService // Inject service
  ) { }

  ngOnInit(): void {
    // 1. Initialize the form with ONLY the required fields
    this.staffForm = this.fb.group({
      Table_No: ['', Validators.required],
      Steward: ['', Validators.required],
      Manager: ['', Validators.required]
    });
  }

  onFinalSubmit(): void{
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      this.finalSubmissionStatus = 'server_error'; // Reusing 'server_error' for simple error display on Page 2
      return;
    }

    this.showLoader = true;
    this.finalSubmissionStatus = 'submitting';

    // 2. Combine guest data (Page 1) and staff data (Page 2)
    const guestData = this.dataTransfer.getGuestData();
    const staffData = this.staffForm.value;
    const finalData = { ...guestData, ...staffData }; // Merge data objects

    console.log('Final Data to Submit:', finalData);

    // --- Submission Logic (Keep your existing HTTP request logic) ---
    const body = new URLSearchParams();
    body.set('data', JSON.stringify(finalData));
    
    const headers = new HttpHeaders({ 
        'Content-Type': 'application/x-www-form-urlencoded' 
    });
    
    this.http.post(this.SCRIPT_URL, body.toString(), { headers }).subscribe({
        next: (response) => {
            console.log('Final Submission Success:', response);
            this.finalSubmissionStatus = 'success';
            this.showLoader = false;
            this.dataTransfer.clearData(); // Clear the temporary data
            this.staffForm.reset();
            
            // ⭐️ NEW: Emit the event to signal to the parent to reset the whole application
            this.submissionComplete.emit(); 
        },
        error: (error) => {
            console.error('Final Submission Error:', error);
            this.finalSubmissionStatus = 'server_error';
            this.showLoader = false;
        }
    });
  }
}
